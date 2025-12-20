import { Container, Graphics } from "pixi.js";
import gsap from "gsap";
import { Passenger } from "./Passenger";
import { Direction} from "../../assets/configs/types";

type ElevatorOptions = {
    cabinWidth?: number;
    cabinHeight?: number;
    color?: number;
    capacity?: number;
};

export class Elevator extends Container {
    private cabin = new Graphics();
    private capacity: number;
    private passengers: Passenger[] = [];

    currentFloor = 0;
    direction: Direction = "UP";
    isMoving = false;


    onStop?: (floorIndex: number) => void;

    constructor(options: ElevatorOptions = {}) {
        super();
        this.capacity = options.capacity ?? 2;
        this.drawCabin(options);
        this.addChild(this.cabin);
    }

    private drawCabin({
                          cabinWidth = 60,
                          cabinHeight = 45,
                          color = 0x333333,
                      }: ElevatorOptions) {
        this.cabin
            .clear()
            .roundRect(
                -cabinWidth / 2,
                -cabinHeight / 2,
                cabinWidth,
                cabinHeight,
                8
            )
            .fill(color);
    }

    moveToFloor(floorIndex: number, y: number, animate = true) {
        this.direction =
            floorIndex > this.currentFloor ? "UP" : "DOWN";

        if (animate) {
            gsap.to(this, {
                y,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    this.currentFloor = floorIndex;
                    this.onStop?.(floorIndex);
                },
            });
        } else {
            this.y = y;
            this.currentFloor = floorIndex;
        }
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
                this.removeChild(p);
                dropped.push(p);
            }
        }

        this.relayout();
        return dropped;
    }

    takePassengers(passengers: Passenger[]) {
        for (const p of passengers) {
            if (!this.hasFreeSpace()) break;

            this.passengers.push(p);
            this.addChild(p);
        }

        this.relayout();
    }

    private relayout() {
        this.passengers.forEach((p, i) => {
            p.x = 0;
            p.y = -i * 28;
        });
    }

    getPassengerCount(): number {
        return this.passengers.length;
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

}
