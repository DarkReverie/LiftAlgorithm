import { LevelScene } from "../../scenes/LevelScene";
import { MenuScene } from "../../scenes/MenuScene";

export class SceneFactory {
  static create(type: string, payload?: any) {
    switch (type) {
      case "MENU":
        return new MenuScene();
      case "LEVEL":
        return new LevelScene(payload);
    }

    throw new Error("Unknown scene type: " + type);
  }
}
