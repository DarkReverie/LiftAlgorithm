import {Container, Renderer} from "pixi.js";
import gsap from "gsap";

export class BaseScene extends Container {
    protected renderer!: Renderer;

    async init(): Promise<void> {}
    resize(stageConfig: any) {
    }
    destroy(options?: any) {
        gsap.killTweensOf(this);
        super.destroy({ children: true });
    }
    update?(delta: number): void;

    setRenderer(renderer: Renderer) {
        this.renderer = renderer;
    }

}