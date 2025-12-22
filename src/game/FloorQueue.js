"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloorQueue = void 0;
const pixi_js_1 = require("pixi.js");
class FloorQueue extends pixi_js_1.Container {
    floorIndex;
    passengers = [];
    constructor(floorIndex) {
        super();
        this.floorIndex = floorIndex;
    }
    addPassenger(passenger) {
        passenger.x = this.passengers.length * 30;
        passenger.y = 0;
        this.passengers.push(passenger);
        this.addChild(passenger);
    }
    hasPassengers(direction) {
        return this.passengers.some(p => direction === "UP"
            ? p.toFloor > this.floorIndex
            : p.toFloor < this.floorIndex);
    }
    takePassengers(capacity, direction) {
        const taken = [];
        for (let i = this.passengers.length - 1; i >= 0; i--) {
            if (taken.length >= capacity)
                break;
            const p = this.passengers[i];
            const canGo = direction === "UP"
                ? p.toFloor > this.floorIndex
                : p.toFloor < this.floorIndex;
            if (!canGo)
                continue;
            this.passengers.splice(i, 1);
            this.removeChild(p);
            taken.push(p);
        }
        this.relayout();
        return taken;
    }
    relayout() {
        this.passengers.forEach((p, i) => {
            p.x = i * 30;
            p.y = 0;
        });
    }
}
exports.FloorQueue = FloorQueue;
