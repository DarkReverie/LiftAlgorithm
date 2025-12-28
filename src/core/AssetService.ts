import { Assets } from "pixi.js";

export class AssetService {

    private static manifest: any;
    private static soundKeys: string[] = [];
    private static soundsMap = new Map<string, string>();
    private static imageAliases: string[] = [];



    static async init() {
        const res = await fetch("assets/manifest.json");
        this.manifest = await res.json();

        this.loadImages();
        this.loadSounds();
        await Assets.load(this.imageAliases);


    }

    private static loadImages() {
        for (const key in this.manifest.images) {
            const fileName = key.split("/").pop()!;
            const alias = fileName.replace(/\.[^/.]+$/, "");

            Assets.add({alias, src: this.manifest.images[key]});

            this.imageAliases.push(alias);
        }
    }
    private static loadSounds(){
        for(const key in this.manifest.sounds){
            const alias = key.split("/").pop()!.replace(/\.[^/.]+$/, "");
            const url = this.manifest.sounds[key];
            this.soundsMap.set(alias, url);
            this.soundKeys.push(alias);
        }
    }

    static getSoundKeys(){
        return this.soundKeys;
    }

    static getSoundUrl(alias:string){
        return this.soundsMap.get(alias)!;
    }

    static getTexture<T = any>(key: string): T {
        const asset = Assets.get(key);
        if (!asset) {
            console.warn(`[AssetService] Asset "${key}" not found`);
        }
        return asset;
    }
}
