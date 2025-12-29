import { Game } from './core/Game';

(async () => {
  const game = Game.getInstance();
  await game.init();

  (globalThis as any).__GAME__ = game;
})();
