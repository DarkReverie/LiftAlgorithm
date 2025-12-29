import { Game } from "./core/base/Game";

(async () => {
  const game = Game.getInstance();
  await game.init();

  (globalThis as any).__GAME__ = game;
})();
