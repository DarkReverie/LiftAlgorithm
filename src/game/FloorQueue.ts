import { Container } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";

import { Direction } from "../../assets/configs/types";
import { tweenGroup } from "../core/tweenGroupUtility";

import { Passenger } from "./Passenger";
const QUEUE_SPACING = 30;
const SPAWN_OFFSET = 80;
export class FloorQueue extends Container {
  readonly floorIndex: number;
  private passengers: Passenger[] = [];

  constructor(floorIndex: number) {
    super();
    this.floorIndex = floorIndex;
  }

  addPassenger(passenger: Passenger) {
    const index = this.passengers.length;
    const targetX = index * QUEUE_SPACING;

    passenger.x = targetX + SPAWN_OFFSET;
    passenger.y = 0;
    passenger.alpha = 0;

    this.addChild(passenger);
    passenger.setWalk();
    const state = {
      x: passenger.x,
      alpha: 0,
    };
    passenger.setSpriteScale(-passenger.scale.x, passenger.scale.y);
    new Tween(state, tweenGroup)
      .to(
        {
          x: targetX,
          alpha: 1,
        },
        800,
      )
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => {
        passenger.x = state.x;
        passenger.alpha = state.alpha;
      })
      .onComplete(() => {
        passenger.setIdle();
        this.passengers.push(passenger);
        this.relayout();
      })
      .start();
  }

  hasPassengers(direction: Direction): boolean {
    return this.passengers.some((p) =>
      direction === "UP" ? p.toFloor > this.floorIndex : p.toFloor < this.floorIndex,
    );
  }

  async takePassengers(capacity: number, direction: Direction): Promise<Passenger[]> {
    const taken: Passenger[] = [];

    for (let i = 0; i < this.passengers.length; ) {
      if (taken.length >= capacity) break;

      const p = this.passengers[i]!;

      const canGo = direction === "UP" ? p.toFloor > this.floorIndex : p.toFloor < this.floorIndex;

      if (!canGo) {
        i++;
        continue;
      }

      this.passengers.splice(i, 1);

      await p.leaveQueue(-40);

      this.removeChild(p);
      taken.push(p);
    }

    this.relayout();
    return taken;
  }

  getFirstPassengerInQueue(): Passenger | undefined {
    return this.passengers[0];
  }

  private relayout() {
    this.passengers.forEach((p, i) => {
      p.x = i * 30;
      p.y = 0;
    });
  }
}
