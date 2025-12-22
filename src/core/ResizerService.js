"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResizerService = void 0;
const stages_1 = require("../../assets/configs/stages");
const BaseScene_1 = require("./BaseScene");
class ResizerService {
    game;
    constructor(game) {
        this.game = game;
    }
    resize() {
        const renderer = this.game.app.renderer;
        const container = this.game.app.stage;
        const screen = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        const orientation = screen.width > screen.height ? "land" : "port";
        const stageConf = stages_1.view.screen[orientation];
        const scale = Math.min(screen.width / stageConf.width, screen.height / stageConf.height);
        renderer.resize(screen.width, screen.height);
        container.scale.set(scale);
        container.x = (screen.width - stageConf.width * scale) / 2;
        container.y = (screen.height - stageConf.height * scale) / 2;
        this.resizeChildren(stageConf);
    }
    resizeChildren(stageConf) {
        this.game.app.stage.children.forEach(child => {
            if (child instanceof BaseScene_1.BaseScene) {
                child.resize(stageConf);
            }
        });
    }
}
exports.ResizerService = ResizerService;
