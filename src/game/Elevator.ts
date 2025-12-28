import { Container, Graphics } from "pixi.js";
import { Passenger } from "./Passenger";
import { Direction} from "../../assets/configs/types";
import { Tween, Easing } from "@tweenjs/tween.js";
import { tweenGroup } from "../core/tweenGroupUtility";


type ElevatorOptions = {
    cabinWidth: number;
    floorHeight: number;
    lineColor?: number;
    lineWidth?: number;
    capacity?: number;
};

export class Elevator extends Container {
    private gfx = new Graphics();
    private capacity: number;
    private passengers: Passenger[] = [];

    currentFloor = 0;
    direction: Direction = "UP";
    isMoving = false;

    onStop?: (floorIndex: number) => void;

    private cabinWidth: number;
    private floorHeight: number;

    constructor(options: ElevatorOptions) {
        super();

        this.capacity = options.capacity ?? 2;
        this.cabinWidth = options.cabinWidth;
        this.floorHeight = options.floorHeight;

        this.drawElevator(options);
        this.gfx.x = this.cabinWidth * 0.3;
        this.addChild(this.gfx);
    }

    private drawElevator({
                             lineColor = 0xffffff,
                             lineWidth = 4,
                         }: ElevatorOptions) {
        const w = this.cabinWidth;
        const h = this.floorHeight * 0.8;

        const halfW = w / 2;

        this.gfx.clear();
        this.gfx.setStrokeStyle({
            width: lineWidth,
            color: lineColor,
            alpha: 1,
        });

        this.gfx
            .moveTo(-halfW, 0)
            .lineTo(halfW, 0)
            .stroke();

        this.gfx
            .moveTo(-halfW, 0)
            .lineTo(-halfW, -h)
            .stroke();

        this.gfx
            .moveTo(-halfW, -h)
            .lineTo(halfW, -h)
            .stroke();
    }



    moveToFloorAsync(floor: number, y: number): Promise<void> {
        this.direction = floor > this.currentFloor ? "UP" : "DOWN";

        return new Promise(resolve => {
            const start = { y: this.y };

            new Tween(start, tweenGroup)
                .to({ y }, 600)
                .easing(Easing.Quadratic.InOut)
                .onUpdate(v => {
                    this.y = v.y;
                })
                .onComplete(() => {
                    this.currentFloor = floor;
                    resolve();
                })
                .start();
        });
    }


    hasFreeSpace(): boolean {
        return this.passengers.length < this.capacity;
    }


    dropOffPassengers(floorIndex: number): Passenger[] {
        const dropped: Passenger[] = [];

        for (let i = this.passengers.length - 1; i >= 0; i--) {
            const p = this.passengers[i]!;
            if (p.toFloor === floorIndex) {
                this.passengers.splice(i, 1);
                dropped.push(p);
            }
        }

        this.relayout();
        return dropped;
    }

    async takePassengers(passengers: Passenger[]) {
        for (const p of passengers) {
            this.addChild(p);
            p.x = 0;
            p.y = 0;
            p.visible = true;
            p.setSpriteScale(p.scale.x, p.scale.y);

            this.passengers.push(p);
            this.relayout();
        }
    }

    async boardPassenger(p: Passenger): Promise<void> {
        this.addChild(p);

        p.setIdle();
        p.setSpriteScale(Math.abs(p.scale.x), p.scale.y);

        this.passengers.push(p);
        this.relayout();
    }


    private relayout() {
        this.passengers.forEach((p, i) => {
            p.x = i * 28;
            p.y = 0;
        });
    }

    getPassengerCount(): number {
        return this.passengers.length;
    }
    isEmpty(): boolean {
        return this.passengers.length === 0;
    }
    getFloorHeight(): number {
        return this.floorHeight;
    }
    getCabinWidth(): number {
        return this.cabinWidth;
    }
    getCapacity(): number {
        return this.capacity;
    }
    getEffectiveDirection(
        floorIndex: number,
        floorsCount: number
    ): Direction {
        if (floorIndex === 0) return "UP";
        if (floorIndex === floorsCount - 1) return "DOWN";
        return this.direction;
    }

    hasPassengersForFloor(floorIndex: number) {
        return this.passengers.some(p => p.toFloor === floorIndex);
    }

    getFreeSpace() {
        return this.capacity - this.passengers.length;
    }

    getPassengers() {
        return this.passengers;
    }
}
