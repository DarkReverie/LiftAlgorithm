import {Container, Renderer, Text} from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";

import {FloorQueue} from "../game/FloorQueue";
import {Passenger} from "../game/Passenger";
import {FloorSpriteFactory} from "../core/FloorSpriteFactory";
import { tweenGroup } from "../core/tweenGroupUtility";
type FloorsRendererOptions = {
    renderer: Renderer,
    floors: number;
    floorStep: number;
    width: number;
    height: number;
    color?: number;
    rectHeight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    labelStyle?: any;
    labelOffsetX?: number;
    startY?: number;
};

export class FloorsRenderer extends Container {
    private labels = new Container();
    private options: FloorsRendererOptions;
    private floorSprites = new Container();
    private floorSpacing = 0;


    private floorCenters: number[] = [];
    private queues: FloorQueue[] = [];
    private spawnTimers: number[] = [];
    constructor(options: FloorsRendererOptions) {
        super();
        this.options = options;

        this.addChild(this.floorSprites);
        this.addChild(this.labels);
        this.draw();
        this.initQueues(options.floors);
        this.startSpawningPassengers();
    }

    private draw() {
        const {
            floors,
            width,
            color = 0x000000,
            rectHeight = 8,
            labelStyle,
            labelOffsetX = -20,
            floorStep = 120,
            startY = 0,
        } = this.options as any;

        this.floorSprites.removeChildren();
        this.labels.removeChildren();
        this.floorCenters = [];

        if (floors <= 0) return;


        this.floorSpacing = floorStep;

        for (let i = 0; i < floors; i++) {

            const centerY = startY - i * floorStep;

            const sprite = FloorSpriteFactory.createFloorSprite(
                this.options.renderer,
                width,
                rectHeight,
                color,
            );
            sprite.x = 0;
            sprite.y = centerY - rectHeight / 2;

            this.floorSprites.addChild(sprite);

            this.addLabel(i + 1, centerY, labelStyle, labelOffsetX);
            this.floorCenters.push(centerY);
        }
    }

    private addLabel(
        labelIndex: number,
        centerY: number,
        style?: any,
        offsetX = -20,
    ) {
        const text = new Text({
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

    private initQueues(floors: number) {
        this.queues = [];

        for (let i = 0; i < floors; i++) {
            const queue = new FloorQueue(i);
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
    private scheduleSpawnForFloor(floorIndex: number) {
        const delay = this.random(4000, 10000);

        this.spawnTimers[floorIndex] = window.setTimeout(() => {
            this.spawnPassengerOnFloor(floorIndex);
            this.scheduleSpawnForFloor(floorIndex);
        }, delay);
    }
    private async spawnPassengerOnFloor(floorIndex: number): Promise<void> {
        const queue = this.queues[floorIndex];

        if (!queue) {
            console.warn("Queue not found for floor", floorIndex);
            return;
        }

        const totalFloors = this.queues.length;

        let targetFloor: number;
        do {
            targetFloor = Math.floor(Math.random() * totalFloors);
        } while (targetFloor === floorIndex);

        const passenger = new Passenger(floorIndex, targetFloor);
        await passenger.init();
        const spacing = this.getFloorSpacing();
        const passengerHeight = passenger.getHeight();

        if (passengerHeight > spacing) {
            const scale = spacing / passengerHeight;

            passenger.scale.set(scale);
        }
        queue.addPassenger(passenger);
    }

    exitPassenger(passenger: Passenger, floorIndex: number): Promise<void> {
        const floorContainer = this.getQueue(floorIndex);
        if (!floorContainer) return Promise.resolve();

        const worldPos = passenger.getGlobalPosition();

        floorContainer.addChild(passenger);
        const local = floorContainer.toLocal(worldPos);
        passenger.position.copyFrom(local);

        passenger.setWalk();

        const exitX = this.getExitX();

        return new Promise(resolve => {
            new Tween({ x: passenger.x, alpha: 1 }, tweenGroup)
                .to({ x: passenger.x + exitX, alpha: 0 }, 800)
                .easing(Easing.Quadratic.Out)
                .onUpdate(v => {
                    passenger.x = v.x;
                    passenger.alpha = v.alpha;
                })
                .onComplete(() => {
                    passenger.removeFromParent();
                    resolve();
                })
                .start();
        });
    }


    private random(min: number, max: number) {
        return min + Math.random() * (max - min);
    }

    getQueue(floorIndex: number): FloorQueue | undefined {
        return this.queues[floorIndex];
    }
    getFloorY(floorIndex: number): number {
        return this.floorCenters[floorIndex] ?? 0;
    }
    getFloorSpacing(): number {
        return this.floorSpacing;
    }
    getExitX(): number {
        return this.options.width / 4 + 40;
    }
    getFloorsCount() {
        return this.options.floors;
    }
}
