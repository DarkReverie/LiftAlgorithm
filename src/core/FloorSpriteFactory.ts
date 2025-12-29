import { Graphics, Renderer, Texture, Sprite } from "pixi.js";

type FloorKey = string;

export class FloorSpriteFactory {
  private static textureCache = new Map<FloorKey, Texture>();

  private static createTexture(
    renderer: Renderer,
    width: number,
    height: number,
    color: number,
  ): Texture {
    const gfx = new Graphics().rect(0, 0, width, height).fill(color);

    const texture = renderer.generateTexture(gfx);
    gfx.destroy(true);

    return texture;
  }

  static createFloorSprite(
    renderer: Renderer,
    width: number,
    height: number,
    color: number,
  ): Sprite {
    const key = `${width}_${height}_${color}`;

    let texture = this.textureCache.get(key);
    if (!texture) {
      texture = this.createTexture(renderer, width, height, color);
      this.textureCache.set(key, texture);
    }

    return new Sprite(texture);
  }
}
