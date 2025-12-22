"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Passenger = void 0;
const pixi_js_1 = require("pixi.js");
const AssetService_1 = require("../core/AssetService");
class Passenger extends pixi_js_1.Container {
    fromFloor;
    toFloor;
    direction;
    sprite;
    state = "idle";
    animations;
    constructor(fromFloor, toFloor) {
        super();
        this.fromFloor = fromFloor;
        this.toFloor = toFloor;
        this.direction = toFloor > fromFloor ? "UP" : "DOWN";
        this.init();
    }
    async init() {
        const sheet = await AssetService_1.AssetService.getTexture(this.direction === "UP"
            ? "passenger_up"
            : "passenger_down");
        this.animations = {
            idle: sheet.animations.idle,
            walk: sheet.animations.walk,
        };
        this.sprite = new pixi_js_1.AnimatedSprite(this.animations.idle);
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
    setState(state) {
        if (this.state === state || !this.sprite)
            return;
        const textures = this.animations[state];
        if (!textures)
            return;
        this.sprite.textures = textures;
        this.sprite.play();
        this.state = state;
    }
    destroy(options) {
        if (this.sprite) {
            this.sprite.stop();
        }
        super.destroy(options);
    }
}
exports.Passenger = Passenger;
