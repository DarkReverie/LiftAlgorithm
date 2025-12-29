import { Container, Renderer } from "pixi.js";

import { tweenGroup } from "./tweenGroupUtility";

export class BaseScene extends Container {
  protected renderer!: Renderer;

  async init(): Promise<void> {}
  resize(stageConfig: any) {}
  destroy(options?: any) {
    tweenGroup.removeAll();
    super.destroy({ children: true });
  }
  update?(delta: number): void;

  setRenderer(renderer: Renderer) {
    this.renderer = renderer;
  }
}
