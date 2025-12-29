import { Container, AnimatedSprite, Spritesheet, Texture, Text } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";

import { AssetService } from "../core/services/AssetService";
import { TextStyles } from "../../assets/configs/styles";
import { tweenGroup } from "../core/utils/tweenGroupUtility";

export type PassengerDirection = "UP" | "DOWN";
export type PassengerState = "idle" | "walk";

export class Passenger extends Container {
  readonly fromFloor: number;
  readonly toFloor: number;
  readonly direction: PassengerDirection;

  private sprite!: AnimatedSprite;
  private title!: Text;

  private state: PassengerState = "idle";
  private animations!: Record<PassengerState, Texture[]>;

  constructor(fromFloor: number, toFloor: number) {
    super();

    this.fromFloor = fromFloor;
    this.toFloor = toFloor;
    this.direction = toFloor > fromFloor ? "UP" : "DOWN";
  }

  async init() {
    const sheet = AssetService.getTexture<Spritesheet>(
      this.direction === "UP" ? "passenger_up" : "passenger_down",
    );

    if (!sheet || !sheet.animations) {
      throw new Error("Passenger spritesheet not loaded");
    }

    const idleKey = this.direction === "DOWN" ? "idle-down" : "idle";
    const walkKey = this.direction === "DOWN" ? "walk-down" : "walk";

    const idle = sheet.animations[idleKey];
    const walk = sheet.animations[walkKey];

    if (!idle || !walk) {
      throw new Error("Passenger animations missing (idle / walk)");
    }

    this.animations = { idle, walk };

    this.sprite = new AnimatedSprite(this.animations.idle);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.animationSpeed = 0.15;
    this.sprite.play();

    this.title = new Text(String(this.toFloor + 1), TextStyles.passengerTitleStyle);

    this.title.anchor.set(0.5, 1);
    this.title.position.set(0, -this.sprite.height / 4);
    this.addChild(this.sprite, this.title);
  }

  setIdle() {
    this.setState("idle");
  }

  setWalk() {
    this.setState("walk");
  }

  setSpriteScale(scaleX: number, scaleY: number) {
    this.sprite.scale.set(scaleX, scaleY);
  }

  async leaveQueue(offsetX: number): Promise<void> {
    this.setWalk();

    return new Promise((resolve) => {
      const startX = this.x;

      new Tween({ x: startX }, tweenGroup)
        .to({ x: startX + offsetX }, 300)
        .easing(Easing.Quadratic.InOut)
        .onUpdate((v) => {
          this.x = v.x;
        })
        .onComplete(() => {
          this.setIdle();
          resolve();
        })
        .start();
    });
  }

  private setState(state: PassengerState) {
    if (this.state === state || !this.sprite) return;

    const textures = this.animations[state];
    if (!textures || textures.length === 0) return;

    this.sprite.textures = textures;
    this.sprite.play();
    this.state = state;
  }

  getHeight(): number {
    return this.sprite?.height ?? 0;
  }
  getToFloor() {
    return this.toFloor;
  }
}
