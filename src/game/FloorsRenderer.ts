import { Container, Renderer, Text } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";

import { FloorSpriteFactory } from "../core/factories/FloorSpriteFactory";
import { tweenGroup } from "../core/utils/tweenGroupUtility";
import { wait } from "../core/utils/waitUtility";
import { TextStyles } from "../../assets/configs/styles";

import { Passenger } from "./Passenger";
import { FloorQueue } from "./FloorQueue";

type FloorsRendererOptions = {
  renderer: Renderer;
  floors: number;
  floorStep: number;
  width: number;
  height: number;
  color?: number;
  rectHeight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  labelOffsetX?: number;
  labelOffsetY?: number;
  startY?: number;
};

export class FloorsRenderer extends Container {
  private labels = new Container();
  private readonly options: FloorsRendererOptions;
  private floorSprites = new Container();

  private floorCenters: number[] = [];
  private queues: FloorQueue[] = [];

  private floorSpacing = 0;
  private spawning = true;

  constructor(options: FloorsRendererOptions) {
    super();
    this.options = options;

    this.addChild(this.floorSprites);
    this.addChild(this.labels);

    this.draw();
    this.initQueues(options.floors);
    this.startSpawningPassengers();
  }

  private draw() {
    const {
      floors,
      width,
      color = 0x000000,
      rectHeight = 8,
      labelOffsetX = 50,
      labelOffsetY = -100,
      floorStep = 120,
      startY = 0,
    } = this.options as any;

    this.floorSprites.removeChildren();
    this.labels.removeChildren();
    this.floorCenters = [];

    this.floorSpacing = floorStep;

    for (let i = 0; i < floors; i++) {
      const centerY = startY - i * floorStep;

      const sprite = FloorSpriteFactory.createFloorSprite(
        this.options.renderer,
        width,
        rectHeight,
        color,
      );

      sprite.x = 0;
      sprite.y = centerY - rectHeight / 2;

      this.floorSprites.addChild(sprite);

      this.addLabel(i + 1, centerY, labelOffsetX, labelOffsetY);
      this.floorCenters.push(centerY);
    }
  }

  private addLabel(labelIndex: number, centerY: number, offsetX = -20, offsetY = 0) {
    const text = new Text({
      text: String(labelIndex),
      style: TextStyles.buttonText,
    });

    text.anchor.set(1, 0.5);
    text.x = offsetX;
    text.y = centerY + offsetY;

    this.labels.addChild(text);
  }

  private initQueues(floors: number) {
    this.queues = [];

    for (let i = 0; i < floors; i++) {
      const queue = new FloorQueue(i);
      queue.position.set(0, this.floorCenters[i] ?? 0);
      this.queues.push(queue);
      this.addChild(queue);
    }
  }

  private startSpawningPassengers() {
    for (let i = 0; i < this.queues.length; i++) {
      this.spawnLoop(i);
    }
  }

  private async spawnLoop(floorIndex: number) {
    while (this.spawning) {
      const delay = this.random(4000, 10000);
      await wait(delay);
      console.log("spawn passenger on floor", floorIndex);
      await this.spawnPassengerOnFloor(floorIndex);
    }
  }

  stopSpawning() {
    this.spawning = false;
  }

  private async spawnPassengerOnFloor(floorIndex: number): Promise<void> {
    const queue = this.queues[floorIndex];
    if (!queue) return;

    const totalFloors = this.queues.length;

    let targetFloor: number;
    do {
      targetFloor = Math.floor(Math.random() * totalFloors);
    } while (targetFloor === floorIndex);

    const passenger = new Passenger(floorIndex, targetFloor);
    await passenger.init();

    const spacing = this.getFloorSpacing();
    const passengerHeight = passenger.getHeight();

    if (passengerHeight > spacing) {
      passenger.scale.set(spacing / passengerHeight);
    }

    queue.addPassenger(passenger);
  }

  exitPassenger(passenger: Passenger, floorIndex: number): Promise<void> {
    const floorContainer = this.getQueue(floorIndex);
    if (!floorContainer) return Promise.resolve();

    const worldPos = passenger.getGlobalPosition();

    floorContainer.addChild(passenger);
    passenger.position.copyFrom(floorContainer.toLocal(worldPos));

    passenger.setWalk();

    const exitX = this.getExitX();

    return new Promise((resolve) => {
      new Tween({ x: passenger.x, alpha: 1 }, tweenGroup)
        .to({ x: passenger.x + exitX, alpha: 0 }, 800)
        .easing(Easing.Quadratic.Out)
        .onUpdate((v) => {
          passenger.x = v.x;
          passenger.alpha = v.alpha;
        })
        .onComplete(() => {
          passenger.removeFromParent();
          resolve();
        })
        .start();
    });
  }

  private random(min: number, max: number) {
    return min + Math.random() * (max - min);
  }

  getQueue(floorIndex: number): FloorQueue | undefined {
    return this.queues[floorIndex];
  }

  getFloorY(floorIndex: number): number {
    return this.floorCenters[floorIndex] ?? 0;
  }

  getFloorSpacing(): number {
    return this.floorSpacing;
  }

  getExitX(): number {
    return this.options.width / 4 + 40;
  }

  getFloorsCount() {
    return this.options.floors;
  }
  override destroy(options?: any): void {
    this.stopSpawning();
    for (const queue of this.queues) {
      queue.removeChildren();
      queue.destroy({ children: true });
    }
    this.queues.length = 0;
    tweenGroup.removeAll();
    this.floorSprites.removeChildren();
    this.labels.removeChildren();
    this.floorSprites.destroy({ children: true });
    this.labels.destroy({ children: true });
    super.destroy(options);
  }
}
