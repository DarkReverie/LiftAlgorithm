import { Sprite } from "pixi.js";

import { BaseScene } from "../core/base/BaseScene";
import { view } from "../../assets/configs/stages";
import { AssetService } from "../core/services/AssetService";
import { signal } from "../core/services/SignalService";
import { EVENTS } from "../../assets/configs/signals";
import { SceneManager } from "../core/managers/SceneManager";
import { Elevator } from "../game/Elevator";
import { wait } from "../core/utils/waitUtility";
import { Passenger } from "../game/Passenger";
import { UILayer } from "../game/UILayer";
import { FloorsRenderer } from "../game/FloorsRenderer";

export class LevelScene extends BaseScene {
  private isDestroyed = false;
  private readonly floors: number;
  private readonly liftCapacity: number;
  private floorsRenderer!: FloorsRenderer;
  private elevator!: Elevator;
  private UILayer!: UILayer;
  private _initialized = false;

  constructor(payload: { floors: number; liftCapacity: number }) {
    super();
    this.floors = payload.floors;
    this.liftCapacity = payload.liftCapacity;
    this.init();
  }

  public async init() {
    const { width, height } = view.screen.land;
    const floorStep = 150;

    await this.loadBackground();

    this.addFloors(width, height, floorStep);
    this.addElevator(floorStep);
    this.addUILayer();

    this.position.set(width / 2, height / 2);
    this._initialized = true;

    SceneManager.getInstance().forceResize();
    this.elevatorLoop();
    signal.dispatch(EVENTS.CAMERA_ZOOM, 2);
  }

  private async loadBackground() {
    const bg = new Sprite(await AssetService.getTexture("main_menu"));
    bg.anchor.set(0.5, 0.5);
    bg.scale.set(3);
    this.addChild(bg);
  }
  private addFloors(width: number, height: number, floorStep: number = 120) {
    const floorsRenderer = (this.floorsRenderer = new FloorsRenderer({
      renderer: this.renderer,
      floors: this.floors,
      width: width * 2,
      height: height * 0.8,
      paddingTop: 20,
      paddingBottom: 20,
      floorStep: floorStep,
      rectHeight: 5,
    }));

    this.addChild(floorsRenderer);
  }

  private addElevator(floorHeight: number) {
    const elevator = (this.elevator = new Elevator({
      cabinWidth: 100,
      capacity: this.liftCapacity,
      floorHeight: floorHeight,
    }));
    elevator.moveToFloorAsync(0, this.floorsRenderer.getFloorY(0));
    this.elevator.onStop = (floorIndex: number) => {
      this.handleStop(floorIndex);
    };

    let currentFloor = 0;

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        currentFloor = Math.min(currentFloor + 1, this.floorsRenderer.getFloorsCount() - 1);
        elevator.moveToFloorAsync(currentFloor, this.floorsRenderer.getFloorY(currentFloor));
      }

      if (e.key === "ArrowDown") {
        currentFloor = Math.max(currentFloor - 1, 0);
        elevator.moveToFloorAsync(currentFloor, this.floorsRenderer.getFloorY(currentFloor));
      }
    });
    const startFloorIndex = 0;
    const startY = this.floorsRenderer.getFloorY(startFloorIndex);
    elevator.position.set(this.floorsRenderer.x - elevator.width, this.floorsRenderer.y + startY);
    this.floorsRenderer.addChild(elevator);
    signal.dispatch(EVENTS.CAMERA_FOLLOW, {
      target: this.elevator,
      snap: true,
    });
  }

  private addUILayer() {
    const uiLayer = (this.UILayer = new UILayer());
    const offsetX = 350;
    const offsetY = 400;
    uiLayer.position.set(this.elevator.x + offsetX, this.elevator.y + offsetY);
    this.addChild(uiLayer);
    uiLayer.follow(this.elevator, 350, 400);
  }

  private findNextFloor(from: number, direction: "UP" | "DOWN"): number | null {
    const floorsCount = this.floorsRenderer.getFloorsCount();

    if (direction === "UP") {
      for (let i = from + 1; i < floorsCount; i++) {
        if (this.hasRequestsOnFloor(i, "UP")) {
          return i;
        }
      }
    } else {
      for (let i = from - 1; i >= 0; i--) {
        if (this.hasRequestsOnFloor(i, "DOWN")) {
          return i;
        }
      }
    }

    return null;
  }
  private findNextTargetFloor(): number | null {
    const current = this.elevator.currentFloor;

    let next = this.findNextFloor(current, this.elevator.direction);
    if (next !== null) return next;

    const opposite = this.elevator.direction === "UP" ? "DOWN" : "UP";
    this.elevator.direction = opposite;

    next = this.findNextFloor(current, opposite);
    if (next !== null) return next;

    return null;
  }

  private findNextDropOffFloor(): number | null {
    const current = this.elevator.currentFloor;
    const targets = this.elevator.getPassengers().map((p) => p.getToFloor());

    if (targets.length === 0) return null;

    if (this.elevator.direction === "UP") {
      return Math.min(...targets.filter((f) => f >= current));
    } else {
      return Math.max(...targets.filter((f) => f <= current));
    }
  }

  private hasRequestsOnFloor(floorIndex: number, direction: "UP" | "DOWN"): boolean {
    const queue = this.floorsRenderer.getQueue(floorIndex);

    if (this.elevator.hasPassengersForFloor(floorIndex)) {
      return true;
    }

    if (!this.elevator.hasFreeSpace()) {
      return false;
    }

    return queue?.hasPassengers(direction) ?? false;
  }

  private async elevatorLoop() {
    let next: number | null;
    while (!this.isDestroyed) {
      if (this.elevator.getPassengerCount() === 0) {
        const first = this.findFirstWaitingPassenger();

        if (!first) {
          await wait(200);
          continue;
        }

        await this.moveToPickup(first.floor);
        const active = await this.handleStop(first.floor);

        if (!active) continue;
      }

      if (!this.elevator.hasFreeSpace()) {
        next = this.findNextDropOffFloor();
      } else {
        next = this.findNextTargetFloor();
      }

      if (next === null) {
        continue;
      }

      await this.moveToPickup(next);
      await this.handleStop(next);
    }
  }

  private findFirstWaitingPassenger(): {
    floor: number;
    passenger: Passenger;
  } | null {
    const floorsCount = this.floorsRenderer.getFloorsCount();

    for (let floor = 0; floor < floorsCount; floor++) {
      const queue = this.floorsRenderer.getQueue(floor);
      if (!queue) continue;

      const passenger = queue.getFirstPassengerInQueue();

      if (passenger) {
        return {
          floor,
          passenger: passenger,
        };
      }
    }

    return null;
  }

  private async handleStop(floorIndex: number): Promise<boolean> {
    const tasks: Promise<any>[] = [];

    const dropped = this.elevator.dropOffPassengers(floorIndex);
    for (const p of dropped) {
      tasks.push(this.floorsRenderer.exitPassenger(p, floorIndex));
    }

    if (this.elevator.getPassengerCount() > 0) {
      tasks.push(this.tryPickupSameDirection(floorIndex));
    } else {
      const queue = this.floorsRenderer.getQueue(floorIndex);
      const first = queue?.getFirstPassengerInQueue();

      if (first) {
        this.elevator.direction = first.getToFloor() > floorIndex ? "UP" : "DOWN";

        tasks.push(this.tryPickupSameDirection(floorIndex));
      }
    }

    await Promise.all([...tasks]);

    return this.elevator.getPassengerCount() > 0;
  }

  private async tryPickupSameDirection(floorIndex: number) {
    if (!this.elevator.hasFreeSpace()) return;

    const queue = this.floorsRenderer.getQueue(floorIndex);
    if (!queue) return;

    const taken = await queue.takePassengers(this.elevator.getFreeSpace(), this.elevator.direction);
    this.elevator.takePassengers(taken);

    await wait(800);
  }

  private async moveToPickup(floor: number) {
    const y = this.floorsRenderer.getFloorY(floor);
    await this.elevator.moveToFloorAsync(floor, y);
  }

  public resize(stageConfig: any) {
    if (!this._initialized) return;

    const { width, height } = stageConfig;
    this.x = width / 2;
    this.y = height / 2;
  }
  public update(delta: number) {
    super.update?.(delta);
  }

  public override destroy(options?: any): void {
    this.isDestroyed = true;

    this.elevator?.destroy();
    this.floorsRenderer?.destroy();
    this.UILayer?.destroy();
    signal.dispatch(EVENTS.CAMERA_STOP, {});
    super.destroy(options);
  }
}
