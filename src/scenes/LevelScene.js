"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelScene = void 0;
const BaseScene_1 = require("../core/BaseScene");
const pixi_js_1 = require("pixi.js");
const stages_1 = require("../../assets/configs/stages");
const AssetService_1 = require("../core/AssetService");
const SignalService_1 = require("../core/SignalService");
const signals_1 = require("../../assets/configs/signals");
const SceneManager_1 = require("../core/SceneManager");
const styles_1 = require("../../assets/configs/styles");
const SoundManager_1 = require("../core/SoundManager");
const FloorsRenderer_1 = require("./FloorsRenderer");
const Elevator_1 = require("../game/Elevator");
class LevelScene extends BaseScene_1.BaseScene {
    floors;
    liftCapacity;
    floorsRenderer;
    elevator;
    pauseBtn;
    soundBtn;
    boosterBtn;
    buttonContainer = new pixi_js_1.Container();
    isComplete = false;
    paused = false;
    _initialized = false;
    handleLevelComplete = (win) => {
        this.isComplete = win;
        SignalService_1.signal.dispatch(win ? signals_1.EVENTS.SOUND_WIN : signals_1.EVENTS.SOUND_LOSE, {});
    };
    constructor(payload) {
        super();
        this.floors = payload.floors;
        this.liftCapacity = payload.liftCapacity;
        this.init();
        SignalService_1.signal.on(signals_1.EVENTS.LEVEL_COMPLETE, this.handleLevelComplete);
    }
    async init() {
        const { width, height } = stages_1.view.screen.land;
        console.log("Floors:", this.floors);
        console.log("Lift capacity:", this.liftCapacity);
        await this.loadBackground(width, height);
        this.addFloors(width, height);
        this.addElevator(width, height);
        this.position.set(width / 2, height / 2);
        this._initialized = true;
        SceneManager_1.SceneManager.getInstance().forceResize();
        setTimeout(() => {
            this.runElevatorLoop();
        }, 300);
    }
    createBoosterButton() {
        const manager = SceneManager_1.SceneManager.getInstance();
        const available = manager.isBoosterAvailable();
        this.boosterBtn = this.button("+30s", () => this.useBooster(), available ? styles_1.UI.buttonColor : 0x555555);
        if (!available)
            this.disable(this.boosterBtn);
    }
    button(text, onClick, color = styles_1.UI.buttonColor) {
        const c = new pixi_js_1.Container();
        c.eventMode = "static";
        c.cursor = "pointer";
        const label = new pixi_js_1.Text({ text, style: styles_1.TextStyles.buttonText });
        label.anchor.set(0.5);
        const bg = new pixi_js_1.Graphics()
            .roundRect(-(label.width + styles_1.UI.buttonPadding) / 2, -(label.height + styles_1.UI.buttonPadding) / 2, label.width + styles_1.UI.buttonPadding, label.height + styles_1.UI.buttonPadding, styles_1.UI.cornerRadius)
            .fill(color);
        c.addChild(bg, label);
        c.on("pointerover", () => (c.tint = styles_1.UI.buttonHoverColor));
        c.on("pointerout", () => (c.tint = 0xffffff));
        c.on("pointerdown", onClick);
        this.buttonContainer.addChild(c);
        return c;
    }
    disable(btn) {
        btn.tint = styles_1.UI.buttonHoverColor;
        btn.eventMode = "none";
        btn.cursor = "default";
    }
    toggleSound() {
        SignalService_1.signal.dispatch(signals_1.EVENTS.SOUND_TOGGLE, {});
        const label = this.soundBtn.getChildAt(1);
        label.text = SoundManager_1.SoundManager.isSoundEnabled() ? "Sound ON" : "Sound OFF";
    }
    useBooster() {
        const manager = SceneManager_1.SceneManager.getInstance();
        if (!manager.isBoosterAvailable())
            return;
        manager.useBooster();
        this.disable(this.boosterBtn);
    }
    async loadBackground(w, h) {
        const bg = new pixi_js_1.Sprite(await AssetService_1.AssetService.getTexture('main_menu'));
        bg.anchor.set(0.5, 0.5);
        bg.scale.set(2);
        this.addChild(bg);
    }
    addFloors(width, height) {
        const floorsRenderer = this.floorsRenderer = new FloorsRenderer_1.FloorsRenderer({
            floors: this.floors,
            width: width * 0.6,
            height: height * 0.8,
            paddingTop: 20,
            paddingBottom: 20,
        });
        this.addChild(floorsRenderer);
    }
    addElevator(width, height) {
        const elevator = this.elevator = new Elevator_1.Elevator({ capacity: this.liftCapacity });
        elevator.position.set(this.floorsRenderer.width / 2 - 60, this.floorsRenderer.y);
        elevator.moveToFloor(0, this.floorsRenderer.getFloorY(0), false);
        this.elevator.onStop = (floorIndex) => {
            this.handleElevatorStop(floorIndex);
        };
        let currentFloor = 0;
        window.addEventListener("keydown", e => {
            if (e.key === "ArrowUp") {
                currentFloor = Math.min(currentFloor + 1, this.floorsRenderer.getFloorsCount() - 1);
                elevator.moveToFloor(currentFloor, this.floorsRenderer.getFloorY(currentFloor));
            }
            if (e.key === "ArrowDown") {
                currentFloor = Math.max(currentFloor - 1, 0);
                elevator.moveToFloor(currentFloor, this.floorsRenderer.getFloorY(currentFloor));
            }
        });
        elevator.position.set(-this.floorsRenderer.width / 2 + 30, 0);
        const startFloorIndex = 0;
        const startY = this.floorsRenderer.getFloorY(startFloorIndex);
        elevator.position.set(this.floorsRenderer.x - this.floorsRenderer.width / 2 - elevator.width / 2 - 20, this.floorsRenderer.y + startY);
        this.floorsRenderer.addChild(elevator);
    }
    handleElevatorStop(floorIndex) {
        const queue = this.floorsRenderer.getQueue(floorIndex);
        if (!queue)
            return;
        this.elevator.dropOffPassengers(floorIndex);
        const direction = this.elevator.getEffectiveDirection(floorIndex, this.floorsRenderer.getFloorsCount());
        if (this.elevator.hasFreeSpace()) {
            const taken = queue.takePassengers(this.elevator.getFreeSpace(), direction);
            this.elevator.takePassengers(taken);
        }
    }
    elevatorCapacityRemaining() {
        return this.elevator.getCapacity() - this.elevator.getPassengerCount();
    }
    findNextFloor(from, direction) {
        const floorsCount = this.floorsRenderer.getFloorsCount();
        if (direction === "UP") {
            for (let i = from + 1; i < floorsCount; i++) {
                if (this.hasRequestsOnFloor(i, "UP")) {
                    return i;
                }
            }
        }
        else {
            for (let i = from - 1; i >= 0; i--) {
                if (this.hasRequestsOnFloor(i, "DOWN")) {
                    return i;
                }
            }
        }
        return null;
    }
    hasRequestsOnFloor(floorIndex, direction) {
        const queue = this.floorsRenderer.getQueue(floorIndex);
        if (this.elevator.hasPassengersForFloor(floorIndex)) {
            return true;
        }
        if (!this.elevator.hasFreeSpace()) {
            return false;
        }
        return queue?.hasPassengers(direction) ?? false;
    }
    runElevatorLoop() {
        if (this.elevator.isMoving)
            return;
        const current = this.elevator.currentFloor;
        let next = this.findNextFloor(current, this.elevator.direction);
        if (next === null) {
            this.elevator.direction =
                this.elevator.direction === "UP" ? "DOWN" : "UP";
            next = this.findNextFloor(current, this.elevator.direction);
        }
        if (next === null) {
            setTimeout(() => this.runElevatorLoop(), 500);
            return;
        }
        this.moveElevatorTo(next);
    }
    moveElevatorTo(floorIndex) {
        this.elevator.isMoving = true;
        const y = this.floorsRenderer.getFloorY(floorIndex);
        this.elevator.moveToFloor(floorIndex, y);
        this.elevator.onStop = floor => {
            this.elevator.currentFloor = floor;
            this.elevator.isMoving = false;
            this.handleElevatorStop(floor);
            setTimeout(() => this.runElevatorLoop(), 800);
        };
    }
    resize(stageConfig) {
        if (!this._initialized)
            return;
        const { width, height } = stageConfig;
        this.x = width / 2;
        this.y = height / 2;
    }
    destroy(options) {
        SignalService_1.signal.off(signals_1.EVENTS.LEVEL_COMPLETE, this.handleLevelComplete);
        super.destroy(options);
    }
}
exports.LevelScene = LevelScene;
