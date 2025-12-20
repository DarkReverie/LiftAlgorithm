import type { Application, Container } from "pixi.js";
import { EVENTS } from "../../assets/configs/signals";
import { signal } from "./SignalService";
import { SceneFactory } from "./SceneFactory";
import { ResizerService } from "./ResizerService";
import gsap from "gsap";
export type LevelPayload = {
    floors: number;
    liftCapacity: number;
};
export class SceneManager {
    private static instance: SceneManager;

    private currentScene: Container | null = null;
    private app!: Application;
    private resizer!: ResizerService;
    private boosterUsed = false;

    private constructor() {}

    static getInstance(): SceneManager {
        if (!this.instance) {
            this.instance = new SceneManager();
        }
        return this.instance;
    }

    init(app: Application, resizer: ResizerService) {
        this.app = app;
        this.resizer = resizer;
        signal.on(EVENTS.LOAD_SCENE, this.handleLoadScene);
    }

    private handleLoadScene = ({
        type,
        payload,
    }: { type: string; payload: any }) => {
        const scene = SceneFactory.create(type, payload);
        this.changeScene(scene, type);
    };

    private resetCurrentScene() {
        if (!this.currentScene) return;

        gsap.globalTimeline.clear();
        this.app.stage.removeChild(this.currentScene);
        this.currentScene.destroy({ children: true });
    }

    changeScene(newScene: Container, type?: string) {
        if (!this.app) throw new Error("SceneManager not initialized.");

        if (type === "MENU") this.resetBooster();

        this.resetCurrentScene();

        this.currentScene = newScene;
        this.app.stage.addChild(newScene);

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
