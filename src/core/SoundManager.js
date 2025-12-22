"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundManager = void 0;
const AssetService_1 = require("./AssetService");
const signals_1 = require("../../assets/configs/signals");
const SignalService_1 = require("./SignalService");
class SoundManager {
    static sounds = new Map();
    static muted = false;
    static async init() {
        await this.loadAll();
        this.subscribeToEvents();
    }
    static async load(key) {
        const url = AssetService_1.AssetService.getSoundUrl(key);
        this.sounds.set(key, new Audio(url));
    }
    static async loadAll() {
        const keys = AssetService_1.AssetService.getSoundKeys();
        for (const key of keys) {
            await this.load(key);
        }
    }
    static subscribeToEvents() {
        SignalService_1.signal.on(signals_1.EVENTS.SOUND_TOGGLE, this.toggleMute);
        SignalService_1.signal.on(signals_1.EVENTS.ENEMY_SLAIN, () => this.play("enemy_kill"));
        SignalService_1.signal.on(signals_1.EVENTS.SOUND_WIN, () => this.play("game_win"));
        SignalService_1.signal.on(signals_1.EVENTS.SOUND_LOSE, () => this.play("game_lose"));
        SignalService_1.signal.on(signals_1.EVENTS.LOAD_SCENE, this.handleSceneLoad);
    }
    static toggleMute = () => {
        this.muted = !this.muted;
        this.updateVolume();
    };
    static handleSceneLoad = ({ type }) => {
        if (type !== "LEVEL")
            return;
        this.stopAll();
        this.play("main_music", true);
        SignalService_1.signal.off(signals_1.EVENTS.LOAD_SCENE, this.handleSceneLoad);
    };
    static updateVolume() {
        this.sounds.forEach(audio => {
            audio.volume = this.muted ? 0 : 1;
        });
    }
    static play(key, loop = false) {
        const audio = this.sounds.get(key);
        if (!audio || this.muted)
            return;
        audio.loop = loop;
        audio.currentTime = 0;
        audio.play();
    }
    static isSoundEnabled() {
        return !this.muted;
    }
    static stopAll() {
        this.sounds.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }
}
exports.SoundManager = SoundManager;
