import { EVENTS } from "../../../assets/configs/signals";
import { AssetService } from "../services/AssetService";
import { signal } from "../services/SignalService";

export class SoundManager {
  private static sounds = new Map<string, HTMLAudioElement>();
  private static muted = false;

  static async init() {
    await this.loadAll();
    this.subscribeToEvents();
  }

  private static async load(key: string) {
    const url = AssetService.getSoundUrl(key);
    this.sounds.set(key, new Audio(url));
  }

  private static async loadAll() {
    const keys = AssetService.getSoundKeys();
    for (const key of keys) {
      await this.load(key);
    }
  }

  private static subscribeToEvents() {
    signal.on(EVENTS.SOUND_TOGGLE, this.toggleMute);
    signal.on(EVENTS.LOAD_SCENE, this.handleSceneLoad);
  }

  private static toggleMute = () => {
    this.muted = !this.muted;
    this.updateVolume();
  };

  private static handleSceneLoad = ({ type }: { type: string }) => {
    if (type !== "LEVEL") return;

    this.stopAll();
    this.play("main_music", true);

    signal.off(EVENTS.LOAD_SCENE, this.handleSceneLoad);
  };

  private static updateVolume() {
    this.sounds.forEach((audio) => {
      audio.volume = this.muted ? 0 : 1;
    });
  }

  static play(key: string, loop = false) {
    const audio = this.sounds.get(key);
    if (!audio || this.muted) return;

    audio.loop = loop;
    audio.currentTime = 0;
    audio.play();
  }

  static stopAll() {
    this.sounds.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}
