"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = require("./core/Game");
(async () => {
    const game = Game_1.Game.getInstance();
    await game.init();
    globalThis.__GAME__ = game;
})();
