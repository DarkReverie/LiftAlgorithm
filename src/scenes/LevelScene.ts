import { BaseScene } from "../core/BaseScene";
import {Sprite, Container, Text, Graphics, Renderer} from "pixi.js";
import { view } from "../../assets/configs/stages";
import { AssetService } from "../core/AssetService";
import { signal } from "../core/SignalService";
import { EVENTS } from "../../assets/configs/signals";

import { SceneManager } from "../core/SceneManager";
import { TextStyles, UI } from "../../assets/configs/styles";
import { SoundManager } from "../core/SoundManager";
import {FloorsRenderer} from "./FloorsRenderer";
import {Elevator} from "../game/Elevator";
import {wait} from "../core/waitUtility";
import {Passenger} from "../game/Passenger";

export class LevelScene extends BaseScene {
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
        const floorStep = 150
        console.log("Floors:", this.floors);
        console.log("Lift capacity:", this.liftCapacity);
        await this.loadBackground(width, height);

        this.addFloors(width, height, floorStep);
        this.addElevator(floorStep)


        this.position.set(width / 2, height / 2);
        this._initialized = true;

        SceneManager.getInstance().forceResize();
        setTimeout(() => {
            this.elevatorLoop();
        }, 300);
        signal.dispatch(EVENTS.CAMERA_ZOOM, 2);

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

    private toggleSound() {
        signal.dispatch(EVENTS.SOUND_TOGGLE, {});
        const label = this.soundBtn.getChildAt(1) as Text;
        label.text = SoundManager.isSoundEnabled() ? "Sound ON" : "Sound OFF";
    }

    private useBooster() {
        const manager = SceneManager.getInstance();
        if (!manager.isBoosterAvailable()) return;

        manager.useBooster();
        this.disable(this.boosterBtn);
    }

    private async loadBackground(w: number, h: number) {
        const bg = new Sprite(await AssetService.getTexture('main_menu'));
        bg.anchor.set(0.5, 0.5);
        bg.scale.set(3);
        this.addChild(bg);
    }
    addFloors(width: number, height: number, floorStep: number = 120) {
        const floorsRenderer = this.floorsRenderer = new FloorsRenderer({
            renderer: this.renderer,
            floors: this.floors,
            width: width * 0.6,
            height: height * 0.8,
            paddingTop: 20,
            paddingBottom: 20,
            floorStep: floorStep,
            rectHeight: 5,
        });

        this.addChild(floorsRenderer);
    }



    addElevator(floorHeight: number) {
        const elevator = this.elevator = new Elevator({cabinWidth: 100, capacity: this.liftCapacity, floorHeight: floorHeight});
        elevator.moveToFloorAsync(0, this.floorsRenderer.getFloorY(0));
        this.elevator.onStop = (floorIndex: number) => {
            this.handleStop(floorIndex);
        };

        let currentFloor = 0;

        window.addEventListener("keydown", e => {
            if (e.key === "ArrowUp") {
                currentFloor = Math.min(
                    currentFloor + 1,
                    this.floorsRenderer.getFloorsCount() - 1
                );
                elevator.moveToFloorAsync(currentFloor, this.floorsRenderer.getFloorY(currentFloor));
            }

            if (e.key === "ArrowDown") {
                currentFloor = Math.max(currentFloor - 1, 0);
                elevator.moveToFloorAsync(currentFloor, this.floorsRenderer.getFloorY(currentFloor));
            }
        });
        const startFloorIndex = 0;
        const startY = this.floorsRenderer.getFloorY(startFloorIndex);
        elevator.position.set(
            this.floorsRenderer.x - elevator.width,
            this.floorsRenderer.y + startY
        );
        this.floorsRenderer.addChild(elevator);
        signal.dispatch(EVENTS.CAMERA_FOLLOW, {
            target: this.elevator,
            snap: true,
        });

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

    private findNextDropOffFloor(): number | null {
        const current = this.elevator.currentFloor;
        const targets = this.elevator.getPassengers().map(p => p.getToFloor());

        if (targets.length === 0) return null;

        if (this.elevator.direction === "UP") {
            return Math.min(...targets.filter(f => f >= current));
        } else {
            return Math.max(...targets.filter(f => f <= current));
        }
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


    private async elevatorLoop() {
        let next: number | null;
        while (true) {
            if (this.elevator.getPassengerCount() === 0) {
                const first = this.findFirstWaitingPassenger();

                if (!first) {
                    await wait(200);
                    continue;
                }

                await this.moveToPickup(first.floor);
                const active = await this.handleStop(first.floor);

                if (!active) continue;
            }

            if (!this.elevator.hasFreeSpace()) {
                next = this.findNextDropOffFloor();
            } else {
                next = this.findNextFloor(
                    this.elevator.currentFloor,
                    this.elevator.direction
                );
            }


            if (next === null) {
                continue;
            }

            await this.moveToPickup(next);
            await this.handleStop(next);
        }
    }


    private findFirstWaitingPassenger():
        | { floor: number; passenger: Passenger }
        | null {

        const floorsCount = this.floorsRenderer.getFloorsCount();

        for (let floor = 0; floor < floorsCount; floor++) {
            const queue = this.floorsRenderer.getQueue(floor);
            if (!queue) continue;

            const passenger = queue.getFirstPassengerInQueue();

            if (passenger) {
                return {
                    floor,
                    passenger: passenger,
                };
            }
        }

        return null;
    }

    private async handleStop(floorIndex: number): Promise<boolean> {
        const dropped = this.elevator.dropOffPassengers(floorIndex);

        for (const p of dropped) {
            await this.floorsRenderer.exitPassenger(p, floorIndex);
        }

        if (this.elevator.getPassengerCount() > 0) {
            await this.tryPickupSameDirection(floorIndex);
            return true;
        }

        const queue = this.floorsRenderer.getQueue(floorIndex);
        if (!queue) return false;

        const first = queue.getFirstPassengerInQueue();
        if (!first) return false;

        this.elevator.direction =
            first.getToFloor() > floorIndex ? "UP" : "DOWN";

        await this.tryPickupSameDirection(floorIndex);
        return this.elevator.getPassengerCount() > 0;
    }

    private async tryPickupSameDirection(floorIndex: number) {
        if (!this.elevator.hasFreeSpace()) return;

        const queue = this.floorsRenderer.getQueue(floorIndex);
        if (!queue) return;

        const taken = await queue.takePassengers(
            this.elevator.getFreeSpace(),
            this.elevator.direction
        );
        this.elevator.takePassengers(taken);

        await wait(800);
    }



    private async moveToPickup(floor: number) {
        const y = this.floorsRenderer.getFloorY(floor);
        await this.elevator.moveToFloorAsync(floor, y);
    }

    resize(stageConfig: any) {
        if (!this._initialized) return;

        const { width, height } = stageConfig;
        this.x = width / 2;
        this.y = height / 2;
    }

    override destroy(options?: any): void {
        signal.off(EVENTS.LEVEL_COMPLETE, this.handleLevelComplete);
        signal.dispatch(EVENTS.CAMERA_STOP, {});
        super.destroy(options);
    }
}
