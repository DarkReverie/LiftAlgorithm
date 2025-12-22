"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Elevator = void 0;
const pixi_js_1 = require("pixi.js");
const gsap_1 = __importDefault(require("gsap"));
class Elevator extends pixi_js_1.Container {
    cabin = new pixi_js_1.Graphics();
    capacity;
    passengers = [];
    currentFloor = 0;
    direction = "UP";
    isMoving = false;
    onStop;
    constructor(options = {}) {
        super();
        this.capacity = options.capacity ?? 2;
        this.drawCabin(options);
        this.addChild(this.cabin);
    }
    drawCabin({ cabinWidth = 60, cabinHeight = 45, color = 0x333333, }) {
        this.cabin
            .clear()
            .roundRect(-cabinWidth / 2, -cabinHeight / 2, cabinWidth, cabinHeight, 8)
            .fill(color);
    }
    moveToFloor(floorIndex, y, animate = true) {
        this.direction =
            floorIndex > this.currentFloor ? "UP" : "DOWN";
        if (animate) {
            gsap_1.default.to(this, {
                y,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    this.currentFloor = floorIndex;
                    this.onStop?.(floorIndex);
                },
            });
        }
        else {
            this.y = y;
            this.currentFloor = floorIndex;
        }
    }
    hasFreeSpace() {
        return this.passengers.length < this.capacity;
    }
    dropOffPassengers(floorIndex) {
        const dropped = [];
        for (let i = this.passengers.length - 1; i >= 0; i--) {
            const p = this.passengers[i];
            if (p.toFloor === floorIndex) {
                this.passengers.splice(i, 1);
                this.removeChild(p);
                dropped.push(p);
            }
        }
        this.relayout();
        return dropped;
    }
    takePassengers(passengers) {
        for (const p of passengers) {
            if (!this.hasFreeSpace())
                break;
            this.passengers.push(p);
            this.addChild(p);
        }
        this.relayout();
    }
    relayout() {
        this.passengers.forEach((p, i) => {
            p.x = 0;
            p.y = -i * 28;
        });
    }
    getPassengerCount() {
        return this.passengers.length;
    }
    getCapacity() {
        return this.capacity;
    }
    getEffectiveDirection(floorIndex, floorsCount) {
        if (floorIndex === 0)
            return "UP";
        if (floorIndex === floorsCount - 1)
            return "DOWN";
        return this.direction;
    }
    hasPassengersForFloor(floorIndex) {
        return this.passengers.some(p => p.toFloor === floorIndex);
    }
    getFreeSpace() {
        return this.capacity - this.passengers.length;
    }
}
exports.Elevator = Elevator;
