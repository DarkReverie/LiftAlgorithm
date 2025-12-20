import { BaseScene } from "../core/BaseScene";
import { Sprite, Container, Text, Graphics } from "pixi.js";
import { view } from "../../assets/configs/stages";
import { AssetService } from "../core/AssetService";
import { signal } from "../core/SignalService";
import { EVENTS } from "../../assets/configs/signals";
import { Clock } from "../core/Clock";

import gsap from "gsap";
import { SceneManager } from "../core/SceneManager";
import { TextStyles, UI } from "../../assets/configs/styles";
import { SoundManager } from "../core/SoundManager";
import {FloorsRenderer} from "./FloorsRenderer";
import {Elevator} from "../game/Elevator";

export class LevelScene extends BaseScene {
    private clock!: Clock;
    private floors: number;
    private liftCapacity: number;
    private floorsRenderer!: FloorsRenderer;
    private elevator!: Elevator;


    private pauseBtn!: Container;
    private soundBtn!: Container;
    private boosterBtn!: Container;
    private buttonContainer = new Container();

    private isComplete = false;
    private paused = false;
    private _initialized = false;

    private readonly handleLevelComplete = (win: boolean) => {
        this.isComplete = win;
        signal.dispatch(win ? EVENTS.SOUND_WIN : EVENTS.SOUND_LOSE, {});
    };

    constructor(payload: { floors: number; liftCapacity: number }) {
        super();
        this.floors = payload.floors;
        this.liftCapacity = payload.liftCapacity;
        this.init();

        signal.on(EVENTS.LEVEL_COMPLETE, this.handleLevelComplete);
    }

    async init() {
        const { width, height } = view.screen.land;
        console.log("Floors:", this.floors);
        console.log("Lift capacity:", this.liftCapacity);
        await this.loadBackground(width, height);
        this.addFloors(width, height);
        this.addElevator(width, height)


        this.position.set(width / 2, height / 2);
        this._initialized = true;

        SceneManager.getInstance().forceResize();
        setTimeout(() => {
            this.runElevatorLoop();
        }, 300);
    }


    private initButtons() {
        this.createPauseButton();
        this.createSoundButton();
        this.createBoosterButton();
    }

    private createPauseButton() {
        this.pauseBtn = this.button("Pause", () => this.togglePause());
    }

    private createSoundButton() {
        const initial = SoundManager.isSoundEnabled() ? "Sound ON" : "Sound OFF";
        this.soundBtn = this.button(initial, () => this.toggleSound());
    }

    private createBoosterButton() {
        const manager = SceneManager.getInstance();
        const available = manager.isBoosterAvailable();

        this.boosterBtn = this.button(
            "+30s",
            () => this.useBooster(),
            available ? UI.buttonColor : 0x555555
        );

        if (!available) this.disable(this.boosterBtn);
    }

    private button(text: string, onClick: () => void, color = UI.buttonColor): Container {
        const c = new Container();
        c.eventMode = "static";
        c.cursor = "pointer";

        const label = new Text({ text, style: TextStyles.buttonText });
        label.anchor.set(0.5);

        const bg = new Graphics()
            .roundRect(
                -(label.width + UI.buttonPadding) / 2,
                -(label.height + UI.buttonPadding) / 2,
                label.width + UI.buttonPadding,
                label.height + UI.buttonPadding,
                UI.cornerRadius
            )
            .fill(color);

        c.addChild(bg, label);

        c.on("pointerover", () => (c.tint = UI.buttonHoverColor));
        c.on("pointerout", () => (c.tint = 0xffffff));
        c.on("pointerdown", onClick);

        this.buttonContainer.addChild(c);
        return c;
    }

    private disable(btn: Container) {
        btn.tint = UI.buttonHoverColor;
        btn.eventMode = "none";
        btn.cursor = "default";
    }

    private togglePause() {
        this.paused = !this.paused;

        this.paused ? this.clock.pause() : this.clock.resume();
        this.paused ? gsap.globalTimeline.pause() : gsap.globalTimeline.resume();

        const label = this.pauseBtn.getChildAt(1) as Text;
        label.text = this.paused ? "Paused" : "Pause";
    }

    private toggleSound() {
        signal.dispatch(EVENTS.SOUND_TOGGLE, {});
        const label = this.soundBtn.getChildAt(1) as Text;
        label.text = SoundManager.isSoundEnabled() ? "Sound ON" : "Sound OFF";
    }

    private useBooster() {
        const manager = SceneManager.getInstance();
        if (!manager.isBoosterAvailable()) return;

        this.clock.addTime(30);
        manager.useBooster();
        this.disable(this.boosterBtn);
    }

    private async loadBackground(w: number, h: number) {
        const bg = new Sprite(await AssetService.getTexture('main_menu'));
        bg.anchor.set(0.5, 0.5);
        bg.scale.set(2);
        this.addChild(bg);
    }
    addFloors(width: number, height: number) {
        const floorsRenderer = this.floorsRenderer = new FloorsRenderer({
            floors: this.floors,
            width: width * 0.6,
            height: height * 0.8,
            paddingTop: 20,
            paddingBottom: 20,
        });

        this.addChild(floorsRenderer);
    }



    addElevator(width: number, height: number) {
        const elevator = this.elevator = new Elevator({capacity: this.liftCapacity});

        elevator.position.set(
            this.floorsRenderer.width / 2 - 60,
            this.floorsRenderer.y
        );
        elevator.moveToFloor(0, this.floorsRenderer.getFloorY(0), false);
        this.elevator.onStop = (floorIndex: number) => {
            this.handleElevatorStop(floorIndex);
        };

        let currentFloor = 0;

        window.addEventListener("keydown", e => {
            if (e.key === "ArrowUp") {
                currentFloor = Math.min(
                    currentFloor + 1,
                    this.floorsRenderer.getFloorsCount() - 1
                );
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
        elevator.position.set(
            this.floorsRenderer.x - this.floorsRenderer.width / 2 - elevator.width / 2 - 20,
            this.floorsRenderer.y + startY
        );
        this.floorsRenderer.addChild(elevator);
    }

    handleElevatorStop(floorIndex: number) {
        const queue = this.floorsRenderer.getQueue(floorIndex);
        if (!queue) return;

        this.elevator.dropOffPassengers(floorIndex);

        const direction = this.elevator.getEffectiveDirection(
            floorIndex,
            this.floorsRenderer.getFloorsCount()
        );

        if (this.elevator.hasFreeSpace()) {
            const taken = queue.takePassengers(
                this.elevator.getFreeSpace(),
                direction
            );

            this.elevator.takePassengers(taken);
        }
    }

    private elevatorCapacityRemaining() {
        return this.elevator.getCapacity() - this.elevator.getPassengerCount();
    }


    private findNextFloor(
        from: number,
        direction: "UP" | "DOWN"
    ): number | null {
        const floorsCount = this.floorsRenderer.getFloorsCount();

        if (direction === "UP") {
            for (let i = from + 1; i < floorsCount; i++) {
                if (this.hasRequestsOnFloor(i, "UP")) {
                    return i;
                }
            }
        } else {
            for (let i = from - 1; i >= 0; i--) {
                if (this.hasRequestsOnFloor(i, "DOWN")) {
                    return i;
                }
            }
        }

        return null;
    }

    private hasRequestsOnFloor(
        floorIndex: number,
        direction: "UP" | "DOWN"
    ): boolean {
        const queue = this.floorsRenderer.getQueue(floorIndex);

        if (this.elevator.hasPassengersForFloor(floorIndex)) {
            return true;
        }

        if (!this.elevator.hasFreeSpace()) {
            return false;
        }

        return queue?.hasPassengers(direction) ?? false;
    }


    private runElevatorLoop() {
        if (this.elevator.isMoving) return;

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

    private moveElevatorTo(floorIndex: number) {
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

    resize(stageConfig: any) {
        if (!this._initialized) return;

        const { width, height } = stageConfig;
        this.x = width / 2;
        this.y = height / 2;
    }

    override destroy(options?: any): void {
        signal.off(EVENTS.LEVEL_COMPLETE, this.handleLevelComplete);
        super.destroy(options);
    }
}
