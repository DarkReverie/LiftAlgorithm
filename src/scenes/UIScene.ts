import { Container, Graphics, Text } from "pixi.js";

import { signal } from "../core/SignalService";
import { EVENTS } from "../../assets/configs/signals";
import { BaseScene } from "../core/BaseScene";
import { view } from "../../assets/configs/stages";

export class UIScene extends BaseScene {
  private buttonContainer = new Container();

  private soundBtn!: Container;
  private backBtn!: Container;

  constructor() {
    super();

    this.addChild(this.buttonContainer);
    this.createButtons();
    this.layoutButtons();
  }

  private createButtons() {
    this.soundBtn = this.createButton({
      text: "🔊",
      signalType: EVENTS.SOUND_TOGGLE,
    });

    this.backBtn = this.createButton({
      text: "← MENU",
      signalType: EVENTS.LOAD_SCENE,
      signalPayload: { type: "MENU" },
    });

    this.buttonContainer.addChild(this.soundBtn, this.backBtn);
  }

  private createButton(options: {
    text: string;
    signalType: string;
    signalPayload?: any;
    padding?: number;
    radius?: number;
    bgColor?: number;
    hoverColor?: number;
    textStyle?: any;
  }): Container {
    const {
      text,
      signalType,
      signalPayload,
      padding = 12,
      radius = 10,
      bgColor = 0x2c2c2c,
      hoverColor = 0x444444,
      textStyle = { fill: 0xffffff, fontSize: 18 },
    } = options;

    const container = new Container();
    container.eventMode = "static";
    container.cursor = "pointer";

    const label = new Text({ text, style: textStyle });
    label.anchor.set(0.5);

    const bg = new Graphics();

    const redraw = (color: number) => {
      bg.clear();
      bg.beginFill(color);
      bg.drawRoundedRect(
        -label.width / 2 - padding,
        -label.height / 2 - padding,
        label.width + padding * 2,
        label.height + padding * 2,
        radius,
      );
      bg.endFill();
    };

    redraw(bgColor);

    container.addChild(bg, label);

    container.on("pointerover", () => redraw(hoverColor));
    container.on("pointerout", () => redraw(bgColor));
    container.on("pointerdown", () =>
      signal.dispatch(signalType, signalPayload),
    );

    return container;
  }

  private layoutButtons() {
    const { width, height } = view.screen.land;

    const gap = 40;

    this.buttonContainer.children.forEach((btn, i) => {
      btn.x = i * gap;
    });

    this.buttonContainer.pivot.set(
      this.buttonContainer.width / 2,
      this.buttonContainer.height / 2,
    );

    this.buttonContainer.position.set(
      width * 0.5,
      height * 0.9,
    );
  }

  override resize() {
    this.layoutButtons();
  }
}
