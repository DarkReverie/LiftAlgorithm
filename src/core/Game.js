"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const pixi_js_1 = require("pixi.js");
const ResizerService_1 = require("./ResizerService");
const AssetService_1 = require("./AssetService");
const SceneManager_1 = require("./SceneManager");
const SoundManager_1 = require("./SoundManager");
const SignalService_1 = require("./SignalService");
const signals_1 = require("../../assets/configs/signals");
class Game {
    static instance;
    app;
    resizer;
    sceneManager;
    constructor() {
        this.app = new pixi_js_1.Application();
        globalThis.__PIXI_APP__ = this.app;
        this.resizer = new ResizerService_1.ResizerService(this);
    }
    static getInstance() {
        if (!this.instance)
            this.instance = new Game();
        return this.instance;
    }
    async init() {
        await AssetService_1.AssetService.init();
        await SoundManager_1.SoundManager.init();
        console.log("Assets loaded");
        await this.app.init({
            resizeTo: window,
            backgroundColor: 0x2e2956,
        });
        document.body.appendChild(this.app.canvas);
        this.sceneManager = SceneManager_1.SceneManager.getInstance();
        this.sceneManager.init(this.app, this.resizer);
        window.addEventListener("resize", () => this.resizer.resize());
        SignalService_1.signal.dispatch(signals_1.EVENTS.LOAD_SCENE, { type: "MENU", payload: 0 });
    }
}
exports.Game = Game;
