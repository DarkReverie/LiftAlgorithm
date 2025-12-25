import {Container, Renderer, Sprite, Text} from "pixi.js";
import {FloorQueue} from "../game/FloorQueue";
import {Passenger} from "../game/Passenger";
import {FloorSpriteFactory} from "../core/FloorSpriteFactory";

type FloorsRendererOptions = {
    renderer: Renderer,
    floors: number;
    width: number;
    height: number;
    color?: number;
    rectHeight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    labelStyle?: any;
    labelOffsetX?: number;
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
        this.startSpawningPassengers()
    }

    private draw() {
        const {
            floors,
            width,
            height,
            color = 0x000000,
            rectHeight = 8,
            paddingTop = 0,
            paddingBottom = 0,
            labelStyle,
            labelOffsetX = -20,
        } = this.options;

        this.floorSprites.removeChildren();
        this.labels.removeChildren();
        this.floorCenters = [];

        if (floors <= 0) return;

        const usableHeight = height - paddingTop - paddingBottom;
        this.pivot.set(width / 2, height / 2);

        const texture = FloorSpriteFactory.getFloorTexture(
            this.options.renderer,
            width,
            rectHeight,
            color
        );

        const spacing = floors === 1
            ? 0
            : usableHeight / (floors - 1);
        this.floorSpacing = spacing;

        for (let i = 0; i < floors; i++) {
            const centerY =
                floors === 1
                    ? paddingTop + usableHeight / 2
                    : height - paddingBottom - rectHeight / 2 - i * spacing;

            const sprite = new Sprite(texture);
            sprite.y = centerY - rectHeight / 2;
            sprite.x = 0;

            this.floorSprites.addChild(sprite);
            this.addLabel(i + 1, centerY, labelStyle, labelOffsetX);
            this.floorCenters.push(centerY);
        }
    }

    private addLabel(
        labelIndex: number,
        centerY: number,
        style?: any,
        offsetX = -20
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
        await passenger.init()
        const spacing = this.getFloorSpacing();
        const passengerHeight = passenger.getHeight();

        if (passengerHeight > spacing) {
            const scale = spacing / passengerHeight;

            passenger.scale.set(scale);
        }
        queue.addPassenger(passenger);
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

    getFloorsCount() {
        return this.options.floors;
    }
}
