"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneManager = void 0;
const signals_1 = require("../../assets/configs/signals");
const SignalService_1 = require("./SignalService");
const SceneFactory_1 = require("./SceneFactory");
const gsap_1 = __importDefault(require("gsap"));
class SceneManager {
    static instance;
    currentScene = null;
    app;
    resizer;
    boosterUsed = false;
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = new SceneManager();
        }
        return this.instance;
    }
    init(app, resizer) {
        this.app = app;
        this.resizer = resizer;
        SignalService_1.signal.on(signals_1.EVENTS.LOAD_SCENE, this.handleLoadScene);
    }
    handleLoadScene = ({ type, payload, }) => {
        const scene = SceneFactory_1.SceneFactory.create(type, payload);
        this.changeScene(scene, type);
    };
    resetCurrentScene() {
        if (!this.currentScene)
            return;
        gsap_1.default.globalTimeline.clear();
        this.app.stage.removeChild(this.currentScene);
        this.currentScene.destroy({ children: true });
    }
    changeScene(newScene, type) {
        if (!this.app)
            throw new Error("SceneManager not initialized.");
        if (type === "MENU")
            this.resetBooster();
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
exports.SceneManager = SceneManager;
