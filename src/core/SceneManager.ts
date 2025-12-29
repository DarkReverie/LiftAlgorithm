import { Container, Renderer } from 'pixi.js';

import { EVENTS } from '../../assets/configs/signals';

import { signal } from './SignalService';
import { SceneFactory } from './SceneFactory';
import { ResizerService } from './ResizerService';
import { tweenGroup } from './tweenGroupUtility';
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

  private handleLoadScene = ({ type, payload, ui }: SceneLoadPayload) => {
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

  forceResize() {
    this.resizer.resize();
  }
}
