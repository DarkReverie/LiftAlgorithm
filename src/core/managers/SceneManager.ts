import { Container, Renderer } from "pixi.js";

import { EVENTS } from "../../../assets/configs/signals";
import { signal } from "../services/SignalService";
import { SceneFactory } from "../factories/SceneFactory";
import { ResizerService } from "../services/ResizerService";
import { tweenGroup } from "../utils/tweenGroupUtility";
type SceneLoadPayload = {
  type: string;
  payload?: any;
};
export class SceneManager {
  private static instance: SceneManager;

  private currentScene: Container | null = null;
  private stage!: Container<any>;
  private renderer!: Renderer;
  private resizer!: ResizerService;

  private constructor() {}

  public static getInstance(): SceneManager {
    if (!this.instance) {
      this.instance = new SceneManager();
    }
    return this.instance;
  }
  public init(stageContainer: Container, renderer: Renderer, resizer: ResizerService) {
    this.stage = stageContainer;
    this.renderer = renderer;
    this.resizer = resizer;
    signal.on(EVENTS.LOAD_SCENE, this.handleLoadScene);
    signal.on(EVENTS.APP_UPDATE, (delta: number) => {
      const scene = this.currentScene as any;
      scene?.update?.(delta);
    });
  }

  private handleLoadScene = ({ type, payload }: SceneLoadPayload) => {
    this.resetCurrentScene();

    const scene = SceneFactory.create(type, payload);
    scene.setRenderer(this.renderer);
    this.currentScene = scene;
    this.stage.addChild(scene);

    this.resizer.resize();
  };

  private resetCurrentScene() {
    tweenGroup.removeAll();

    if (this.currentScene) {
      this.stage.removeChild(this.currentScene);
      this.currentScene.destroy({ children: true });
      this.currentScene = null;
    }
  }

  public forceResize() {
    this.resizer.resize();
  }
}
