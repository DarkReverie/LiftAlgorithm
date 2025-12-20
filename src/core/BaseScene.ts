import { Container } from "pixi.js";
import gsap from "gsap";

export class BaseScene extends Container {
    async init(): Promise<void> {}
    resize(stageConfig: any) {
    }
    destroy(options?: any) {
        gsap.killTweensOf(this);
        super.destroy({ children: true });
    }

}