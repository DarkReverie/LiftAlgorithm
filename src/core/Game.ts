import { Application, Container } from "pixi.js";
import { ResizerService } from "./ResizerService";
import { AssetService } from "./AssetService";
import { SceneManager } from "./SceneManager";
import { SoundManager } from "./SoundManager";
import { signal } from "./SignalService";
import { EVENTS } from "../../assets/configs/signals";
import { CameraService } from "./CameraService";

import { Ticker } from "pixi.js";
import * as TWEEN from "@tweenjs/tween.js";
import { tweenGroup } from "./tweenGroupUtility";


export class Game {
    private static instance: Game;

    public app: Application;
    public resizer: ResizerService;
    public sceneManager!: SceneManager;

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
        await AssetService.init();
        await SoundManager.init();

        console.log("Assets loaded");

        await this.app.init({
            resizeTo: window,
            backgroundColor: 0x2e2956,
        });
        Ticker.shared.add(() => {
            tweenGroup.update(performance.now());
        });
        document.body.appendChild(this.app.canvas);

        this.cameraContainer = new Container();
        this.app.stage.addChild(this.cameraContainer);

        this.cameraService = new CameraService(this, this.cameraContainer);
        this.cameraService.play();

        this.sceneManager = SceneManager.getInstance();
        this.sceneManager.init(this.cameraContainer, this.app.renderer, this.resizer);

        window.addEventListener("resize", () => this.resizer.resize());

        signal.dispatch(EVENTS.LOAD_SCENE, { type: "MENU", payload: 0 });

        Ticker.shared.add((ticker) => {
            this.cameraService.update(ticker.deltaMS);
        });

    }
}
