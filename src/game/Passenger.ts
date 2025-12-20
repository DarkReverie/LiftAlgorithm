import { Container, AnimatedSprite } from "pixi.js";
import { AssetService } from "../core/AssetService";

export type PassengerDirection = "UP" | "DOWN";
export type PassengerState = "idle" | "walk";

export class Passenger extends Container {
    readonly fromFloor: number;
    readonly toFloor: number;
    readonly direction: PassengerDirection;

    private sprite!: AnimatedSprite;
    private state: PassengerState = "idle";
    private animations!: Record<PassengerState, any[]>;

    constructor(fromFloor: number, toFloor: number) {
        super();

        this.fromFloor = fromFloor;
        this.toFloor = toFloor;
        this.direction = toFloor > fromFloor ? "UP" : "DOWN";

        this.init();
    }

    private async init() {
        const sheet = await AssetService.getTexture(
            this.direction === "UP"
                ? "passenger_up"
                : "passenger_down"
        );

        this.animations = {
            idle: sheet.animations.idle,
            walk: sheet.animations.walk,
        };

        this.sprite = new AnimatedSprite(this.animations.idle);
        this.sprite.anchor.set(0.5);
        this.sprite.animationSpeed = 0.15;
        this.sprite.play();

        this.addChild(this.sprite);
    }

    setIdle() {
        this.setState("idle");
    }

    setWalk() {
        this.setState("walk");
    }

    private setState(state: PassengerState) {
        if (this.state === state || !this.sprite) return;

        const textures = this.animations[state];
        if (!textures) return;

        this.sprite.textures = textures;
        this.sprite.play();
        this.state = state;
    }


    destroy(options?: any): void {
        if (this.sprite) {
            this.sprite.stop();
        }
        super.destroy(options);
    }
}
