import { LevelScene } from "../scenes/LevelScene";
import { MenuScene } from "../scenes/MenuScene";
import { UIScene } from "../scenes/UIScene";

export class SceneFactory {
    static create(type: string, payload?: any) {

        switch(type) {
            case "MENU":
                return new MenuScene();
            case "LEVEL":
                return new LevelScene(payload);
            case "LEVEL_UI":
              return new UIScene();
        }

        throw new Error("Unknown scene type: " + type);
    }
}
