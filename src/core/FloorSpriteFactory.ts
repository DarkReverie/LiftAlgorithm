import { Graphics, Renderer, Texture } from "pixi.js";

type FloorTextureKey = string;

export class FloorSpriteFactory {
    private static cache = new Map<FloorTextureKey, Texture>();

    static getFloorTexture(
        renderer: Renderer,
        width: number,
        height: number,
        color: number
    ): Texture {
        const key = `${width}_${height}_${color}`;

        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }

        const gfx = new Graphics()
            .rect(0, 0, width, height)
            .fill(color);

        const texture = renderer.generateTexture(gfx);
        gfx.destroy();

        this.cache.set(key, texture);
        return texture;
    }

    static clear() {
        this.cache.forEach(tex => tex.destroy(true));
        this.cache.clear();
    }
}
