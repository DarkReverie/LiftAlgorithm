import { Container } from "pixi.js";
import { Passenger } from "./Passenger";
import { Direction} from "../../assets/configs/types";
import gsap from "gsap";
import {Elevator} from "./Elevator";
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

        gsap.to(passenger, {
            x: targetX,
            alpha: 1,
            duration: 2,
            ease: "power2.out",
            onStart: () => {
                passenger.setWalk();
                passenger.setSpriteScale(-passenger.scale.x, passenger.scale.y);
            },
            onComplete: () => {
                passenger.setIdle();
                this.passengers.push(passenger);

                this.relayout();
            }
        });
    }

    hasPassengers(direction: Direction): boolean {
        return this.passengers.some(p =>
            direction === "UP"
                ? p.toFloor > this.floorIndex
                : p.toFloor < this.floorIndex
        );
    }

    async takePassengers(
        capacity: number,
        direction: Direction
    ): Promise<Passenger[]> {

        const taken: Passenger[] = [];

        for (let i = 0; i < this.passengers.length; ) {
            if (taken.length >= capacity) break;

            const p = this.passengers[i]!;

            const canGo =
                direction === "UP"
                    ? p.toFloor > this.floorIndex
                    : p.toFloor < this.floorIndex;

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
