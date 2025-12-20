import { Assets } from "pixi.js";

export class AssetService {

    private static manifest: any;
    private static soundKeys: string[] = [];
    private static soundsMap = new Map<string, string>();


    static async init() {
        const res = await fetch("assets/manifest.json");
        this.manifest = await res.json();
        this.loadImages();
        this.loadSounds();
    }
    private static loadImages(){
        let fileName: string;
        let alias: string;
        for (const key in this.manifest.images) {
            fileName =  key.split("/").pop()!;
            alias = fileName.replace(/\.[^/.]+$/, "");
            Assets.add({ alias, src: this.manifest.images[key] });
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

    static async getTexture(key: string) {
        return await Assets.load(key);
    }
}
