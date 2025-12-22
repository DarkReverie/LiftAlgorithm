"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneFactory = void 0;
const LevelScene_1 = require("../scenes/LevelScene");
const MenuScene_1 = require("../scenes/MenuScene");
class SceneFactory {
    static create(type, payload) {
        switch (type) {
            case "MENU":
                return new MenuScene_1.MenuScene();
            case "LEVEL":
                return new LevelScene_1.LevelScene(payload);
        }
        throw new Error("Unknown scene type: " + type);
    }
}
exports.SceneFactory = SceneFactory;
