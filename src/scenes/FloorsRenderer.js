"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloorsRenderer = void 0;
const pixi_js_1 = require("pixi.js");
const FloorQueue_1 = require("../game/FloorQueue");
const Passenger_1 = require("../game/Passenger");
class FloorsRenderer extends pixi_js_1.Container {
    gfx = new pixi_js_1.Graphics();
    labels = new pixi_js_1.Container();
    options;
    floorCenters = [];
    queues = [];
    spawnTimers = [];
    constructor(options) {
        super();
        this.options = options;
        this.addChild(this.gfx);
        this.addChild(this.labels);
        this.draw();
        this.initQueues(options.floors);
        this.startSpawningPassengers();
    }
    draw() {
        const { floors, width, height, color = 0x000000, rectHeight = 8, paddingTop = 0, paddingBottom = 0, labelStyle, labelOffsetX = -20, } = this.options;
        this.gfx.clear();
        this.labels.removeChildren();
        this.floorCenters = [];
        if (floors <= 0)
            return;
        const usableHeight = height - paddingTop - paddingBottom;
        this.pivot.set(width / 2, height / 2);
        if (floors === 1) {
            const centerY = paddingTop + usableHeight / 2;
            this.drawFloorRect(centerY, width, rectHeight, color);
            this.addLabel(1, centerY, labelStyle, labelOffsetX);
            this.floorCenters.push(centerY);
            return;
        }
        const spacing = usableHeight / (floors - 1);
        for (let i = 0; i < floors; i++) {
            const centerY = height - paddingBottom - rectHeight / 2 - i * spacing;
            this.drawFloorRect(centerY, width, rectHeight, color);
            this.addLabel(i + 1, centerY, labelStyle, labelOffsetX);
            this.floorCenters.push(centerY);
        }
    }
    drawFloorRect(centerY, width, rectHeight, color) {
        this.gfx
            .rect(0, centerY - rectHeight / 2, width, rectHeight)
            .fill(color);
    }
    addLabel(labelIndex, centerY, style, offsetX = -20) {
        const text = new pixi_js_1.Text({
            text: String(labelIndex),
            style: style ?? {
                fill: 0xffffff,
                fontSize: 38,
                fontWeight: "bold",
            },
        });
        text.anchor.set(1, 0.5);
        text.x = offsetX;
        text.y = centerY;
        this.labels.addChild(text);
    }
    initQueues(floors) {
        this.queues = [];
        for (let i = 0; i < floors; i++) {
            const queue = new FloorQueue_1.FloorQueue(i);
            this.queues.push(queue);
            queue.position.set(0, this.floorCenters[i] ?? 0);
            this.addChild(queue);
        }
    }
    startSpawningPassengers() {
        for (let i = 0; i < this.queues.length; i++) {
            this.scheduleSpawnForFloor(i);
        }
    }
    scheduleSpawnForFloor(floorIndex) {
        const delay = this.random(4000, 10000);
        this.spawnTimers[floorIndex] = window.setTimeout(() => {
            this.spawnPassengerOnFloor(floorIndex);
            this.scheduleSpawnForFloor(floorIndex);
        }, delay);
    }
    spawnPassengerOnFloor(floorIndex) {
        const queue = this.queues[floorIndex];
        if (!queue) {
            console.warn("Queue not found for floor", floorIndex);
            return;
        }
        const totalFloors = this.queues.length;
        let targetFloor;
        do {
            targetFloor = Math.floor(Math.random() * totalFloors);
        } while (targetFloor === floorIndex);
        const passenger = new Passenger_1.Passenger(floorIndex, targetFloor);
        queue.addPassenger(passenger);
    }
    random(min, max) {
        return min + Math.random() * (max - min);
    }
    getQueue(floorIndex) {
        return this.queues[floorIndex];
    }
    getFloorY(floorIndex) {
        return this.floorCenters[floorIndex] ?? 0;
    }
    getFloorsCount() {
        return this.options.floors;
    }
}
exports.FloorsRenderer = FloorsRenderer;
