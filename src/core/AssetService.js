"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetService = void 0;
const pixi_js_1 = require("pixi.js");
class AssetService {
    static manifest;
    static soundKeys = [];
    static soundsMap = new Map();
    static async init() {
        const res = await fetch("assets/manifest.json");
        this.manifest = await res.json();
        this.loadImages();
        this.loadSounds();
    }
    static loadImages() {
        let fileName;
        let alias;
        for (const key in this.manifest.images) {
            fileName = key.split("/").pop();
            alias = fileName.replace(/\.[^/.]+$/, "");
            pixi_js_1.Assets.add({ alias, src: this.manifest.images[key] });
        }
    }
    static loadSounds() {
        for (const key in this.manifest.sounds) {
            const alias = key.split("/").pop().replace(/\.[^/.]+$/, "");
            const url = this.manifest.sounds[key];
            this.soundsMap.set(alias, url);
            this.soundKeys.push(alias);
        }
    }
    static getSoundKeys() {
        return this.soundKeys;
    }
    static getSoundUrl(alias) {
        return this.soundsMap.get(alias);
    }
    static async getTexture(key) {
        return await pixi_js_1.Assets.load(key);
    }
}
exports.AssetService = AssetService;
