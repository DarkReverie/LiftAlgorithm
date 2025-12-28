import type {Application, Container, Renderer} from "pixi.js";

import { EVENTS } from "../../assets/configs/signals";

import { signal } from "./SignalService";
import { SceneFactory } from "./SceneFactory";
import { ResizerService } from "./ResizerService";
import {tweenGroup} from "./tweenGroupUtility";
export type LevelPayload = {
    floors: number;
    liftCapacity: number;
};
export class SceneManager {
    private static instance: SceneManager;

    private currentScene: Container | null = null;
    private stage!: Container<any>;
    private renderer!: Renderer;
    private resizer!: ResizerService;
    private boosterUsed = false;

    private constructor() {}

    static getInstance(): SceneManager {
        if (!this.instance) {
            this.instance = new SceneManager();
        }
        return this.instance;
    }
    init(stageContainer: Container, renderer: Renderer, resizer: ResizerService) {
        this.stage = stageContainer;
        this.renderer = renderer;
        this.resizer = resizer;

        signal.on(EVENTS.LOAD_SCENE, this.handleLoadScene);
        signal.on(EVENTS.APP_UPDATE, (delta: number) => {
            const scene = this.currentScene as any;
            scene?.update?.(delta);
        });
    }


    private handleLoadScene = ({
        type,
        payload,
    }: { type: string; payload: any }) => {

        const scene = SceneFactory.create(type, payload);
        scene.setRenderer(this.renderer);

        this.changeScene(scene, type);
    };

    private resetCurrentScene() {
        if (!this.currentScene) return;

        tweenGroup.removeAll();
        this.stage.removeChild(this.currentScene);
        this.currentScene.destroy({ children: true });
    }

    changeScene(newScene: Container, type?: string) {
        if (!this.stage) throw new Error("SceneManager not initialized.");

        if (type === "MENU") this.resetBooster();

        this.resetCurrentScene();

        this.currentScene = newScene;
        this.stage.addChild(newScene);

        this.resizer.resize();
    }

    isBoosterAvailable() {
        return !this.boosterUsed;
    }

    useBooster() {
        this.boosterUsed = true;
    }

    resetBooster() {
        this.boosterUsed = false;
    }

    forceResize() {
        this.resizer.resize();
    }
}
