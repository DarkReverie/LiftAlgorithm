import { Container } from "pixi.js";
import { Passenger } from "./Passenger";
import { Direction} from "../../assets/configs/types";

export class FloorQueue extends Container {
    readonly floorIndex: number;
    private passengers: Passenger[] = [];

    constructor(floorIndex: number) {
        super();
        this.floorIndex = floorIndex;
    }

    addPassenger(passenger: Passenger) {
        passenger.x = this.passengers.length * 30;
        passenger.y = 0;

        this.passengers.push(passenger);
        this.addChild(passenger);
    }

    hasPassengers(direction: Direction): boolean {
        return this.passengers.some(p =>
            direction === "UP"
                ? p.toFloor > this.floorIndex
                : p.toFloor < this.floorIndex
        );
    }

    takePassengers(
        capacity: number,
        direction: Direction
    ): Passenger[] {
        const taken: Passenger[] = [];

        for (let i = this.passengers.length - 1; i >= 0; i--) {
            if (taken.length >= capacity) break;

            const p = this.passengers[i]!;
            const canGo =
                direction === "UP"
                    ? p.toFloor > this.floorIndex
                    : p.toFloor < this.floorIndex;

            if (!canGo) continue;

            this.passengers.splice(i, 1);
            this.removeChild(p);
            taken.push(p);
        }

        this.relayout();
        return taken;
    }

    private relayout() {
        this.passengers.forEach((p, i) => {
            p.x = i * 30;
            p.y = 0;
        });
    }
}
