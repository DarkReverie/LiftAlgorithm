import { Application, Container } from "pixi.js";
import { ResizerService } from "./ResizerService";
import { AssetService } from "./AssetService";
import { SceneManager } from "./SceneManager";
import { SoundManager } from "./SoundManager";
import { signal } from "./SignalService";
import { EVENTS } from "../../assets/configs/signals";
import { CameraService } from "./CameraService";

import { Ticker } from "pixi.js";

export class Game {
    private static instance: Game;

    public app: Application;
    public resizer: ResizerService;
    public sceneManager!: SceneManager;

    // 🎥 CAMERA
    public cameraContainer!: Container;
    public cameraService!: CameraService;

    private constructor() {
        this.app = new Application();
        globalThis.__PIXI_APP__ = this.app;

        this.resizer = new ResizerService(this);
    }

    static getInstance(): Game {
        if (!this.instance) this.instance = new Game();
        return this.instance;
    }

    async init() {
        // --- INIT ASSETS / SOUND ---
        await AssetService.init();
        await SoundManager.init();

        console.log("Assets loaded");

        // --- INIT PIXI ---
        await this.app.init({
            resizeTo: window,
            backgroundColor: 0x2e2956,
        });

        document.body.appendChild(this.app.canvas);

        // --- CAMERA CONTAINER ---
        this.cameraContainer = new Container();
        this.app.stage.addChild(this.cameraContainer);

        // --- CAMERA SERVICE ---
        this.cameraService = new CameraService(this, this.cameraContainer);
        this.cameraService.play();

        // --- SCENE MANAGER ---
        this.sceneManager = SceneManager.getInstance();
        this.sceneManager.init(this.cameraContainer, this.resizer);
        // ⚠️ Зверни увагу: тепер передаємо cameraContainer, а не app.stage

        // --- RESIZE ---
        window.addEventListener("resize", () => this.resizer.resize());

        // --- START GAME ---
        signal.dispatch(EVENTS.LOAD_SCENE, { type: "MENU", payload: 0 });

        Ticker.shared.add((ticker) => {
            // console.log('DELTA',t);
            signal.dispatch(EVENTS.APP_UPDATE, ticker.deltaMS);
        });

    }
}
