import { view } from '../../assets/configs/stages';

import type { Game } from './Game';
import { BaseScene } from './BaseScene';

export class ResizerService {
  constructor(private game: Game) {}

  resize() {
    const renderer = this.game.app.renderer;
    const container = this.game.app.stage;

    const screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const orientation = screen.width > screen.height ? 'land' : 'port';

    const stageConf = view.screen[orientation];

    const scale = Math.min(screen.width / stageConf.width, screen.height / stageConf.height);

    renderer.resize(screen.width, screen.height);

    container.scale.set(scale);

    container.x = (screen.width - stageConf.width * scale) / 2;
    container.y = (screen.height - stageConf.height * scale) / 2;

    this.resizeChildren(stageConf);
  }

  private resizeChildren(stageConf: any) {
    this.game.app.stage.children.forEach((child) => {
      if ((child as any) instanceof BaseScene) {
        (child as BaseScene).resize(stageConf);
      }
    });
  }
}
