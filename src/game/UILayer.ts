import { Container, Graphics, Text } from "pixi.js";

import { signal } from "../core/services/SignalService";
import { EVENTS } from "../../assets/configs/signals";
import { BaseScene } from "../core/base/BaseScene";
import { TextStyles } from "../../assets/configs/styles";

export class UILayer extends BaseScene {
  private buttonContainer = new Container();

  private soundBtn!: Container;
  private backBtn!: Container;
  private followTarget: Container | null = null;
  private offsetX = 0;
  private offsetY = 0;
  private onUpdateBound = this.update.bind(this);

  constructor() {
    super();

    this.addChild(this.buttonContainer);
    this.createButtons();
    this.layoutButtons();
    signal.on(EVENTS.APP_UPDATE, this.onUpdateBound);
  }

  private createButtons() {
    this.soundBtn = this.createButton({
      text: "🔊",
      signalType: EVENTS.SOUND_TOGGLE,
    });

    this.backBtn = this.createButton({
      text: "MENU",
      signalType: EVENTS.LOAD_SCENE,
      signalPayload: { type: "MENU", payload: 0 },
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
    } = options;

    const container = new Container();
    container.eventMode = "static";
    container.cursor = "pointer";

    const label = new Text({ text, style: TextStyles.buttonText });
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
    container.on("pointerdown", () => signal.dispatch(signalType, signalPayload));

    return container;
  }

  private layoutButtons() {
    const gap = 300;

    this.buttonContainer.children.forEach((btn, i) => {
      btn.x = i * gap;
    });

    this.buttonContainer.pivot.set(this.buttonContainer.width / 2, this.buttonContainer.height / 2);
  }

  public follow(target: Container, offsetX = 0, offsetY = 150) {
    this.followTarget = target;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  public update() {
    if (!this.followTarget) return;

    this.position.set(this.followTarget.x + this.offsetX, this.followTarget.y + this.offsetY);
  }

  override resize() {
    this.layoutButtons();
  }

  destroy(options?: any) {
    super.destroy(options);
    signal.off(EVENTS.APP_UPDATE, this.onUpdateBound);
  }
}
