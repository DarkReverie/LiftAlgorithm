import {Container, Renderer} from "pixi.js";

import { EVENTS } from "../../assets/configs/signals";

import { signal } from "./SignalService";
import { SceneFactory } from "./SceneFactory";
import { ResizerService } from "./ResizerService";
import {tweenGroup} from "./tweenGroupUtility";
type SceneLoadPayload = {
  type: string;
  payload?: any;
  ui?: string | null;
};
export class SceneManager {
    private static instance: SceneManager;

    private currentScene: Container | null = null;
    private stage!: Container<any>;
    private renderer!: Renderer;
    private resizer!: ResizerService;
    private boosterUsed = false;
    private worldLayer!: Container;
    private uiLayer!: Container;

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
        this.worldLayer = new Container();
        this.uiLayer = new Container();
        this.stage.addChild(this.worldLayer);
        this.stage.addChild(this.uiLayer);
        signal.on(EVENTS.LOAD_SCENE, this.handleLoadScene);
        signal.on(EVENTS.APP_UPDATE, (delta: number) => {
            const scene = this.currentScene as any;
            scene?.update?.(delta);
        });
    }


  private handleLoadScene = ({ type, payload, ui}: SceneLoadPayload) => {
    this.resetCurrentScene();


    const scene = SceneFactory.create(type, payload);
    scene.setRenderer(this.renderer);
    this.currentScene = scene;
    this.worldLayer.addChild(scene);

    if (ui) {
      const uiScene = SceneFactory.create(ui, payload);
      this.uiLayer.addChild(uiScene);
    }

    this.resizer.resize();
  };


  private resetCurrentScene() {
    tweenGroup.removeAll();

    if (this.currentScene) {
      this.worldLayer.removeChild(this.currentScene);
      this.currentScene.destroy({ children: true });
      this.currentScene = null;
    }

    this.uiLayer.removeChildren();
  }


  changeScene(newScene: Container, type?: string) {
        if (!this.stage) throw new Error("SceneManager not initialized.");

        if (type === "MENU") this.resetBooster();

        this.resetCurrentScene();

        this.currentScene = newScene;
        this.worldLayer.addChild(newScene);

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
