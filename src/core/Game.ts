import { Application, Container } from "pixi.js";
import { ResizerService } from "./ResizerService";
import { MenuScene } from "../scenes/MenuScene";
import {AssetService} from "./AssetService";
import {SceneManager} from "./SceneManager";
import {SoundManager} from "./SoundManager";
import {signal} from "./SignalService";
import {EVENTS} from "../../assets/configs/signals";

export class Game {
    private static instance: Game;
    app: Application;
    resizer: ResizerService;
    sceneManager!: SceneManager;


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

        document.body.appendChild(this.app.canvas);

        this.sceneManager = SceneManager.getInstance();
        this.sceneManager.init(this.app, this.resizer);


        window.addEventListener("resize", () => this.resizer.resize());
        signal.dispatch(EVENTS.LOAD_SCENE, { type: "MENU", payload: 0 });


    }
}
