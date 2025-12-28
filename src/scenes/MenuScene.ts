import { Sprite, Text, Container, Graphics } from "pixi.js";

import { BaseScene } from "../core/BaseScene";
import { view } from "../../assets/configs/stages";
import { AssetService } from "../core/AssetService";
import { signal } from "../core/SignalService";
import { EVENTS } from "../../assets/configs/signals";
import { TextStyles, UI } from "../../assets/configs/styles";

export class MenuScene extends BaseScene {
    private floorValue = 4;
    private liftCapacityValue = 2;
    constructor() {
        super();
        this.init();
    }

    async init() {
        const designW = view.screen.land.width;
        const designH = view.screen.land.height;

        await this.createBackground(designW, designH);
        this.createTitle(designW, designH);
        this.createControls(designW, designH);
        this.createStartButton(designW, designH);
        this.position.set(designW / 2, designH / 2);
        this.pivot.set(designW / 2, designH / 2);
    }

    private async createBackground(w: number, h: number) {
        const bgTexture = await AssetService.getTexture("main_menu");

        const bg = new Sprite(bgTexture);
        bg.anchor.set(0.5, 0.5);
        bg.scale.set(2);
        bg.position.set(w / 2, h / 2);

        this.addChild(bg);
    }

    private createTitle(w: number, h: number) {
        const title = new Text({
            text: "Choose floor number\n and lift capacity",
            style: TextStyles.buttonText,
        });

        title.anchor.set(0.5);
        title.position.set(w / 2, h / 2 - 200);

        this.addChild(title);
    }

    private createControls(w: number, h: number) {
        const controls = new Container();

        const floorControl = this.createStepper(
            "Floor number",
            () => this.floorValue,
            v => (this.floorValue = v),
            { min: 4 , max: 10},
        );


        const liftControl = this.createStepper(
            "Lift capacity",
            () => this.liftCapacityValue,
            v => (this.liftCapacityValue = v),
            { min: 2, max: 4 },
        );

        floorControl.position.set(w / 2, h / 2 + 100);
        liftControl.position.set(w / 2, h / 2 + 300);

        controls.addChild(floorControl, liftControl);
        this.addChild(controls);
    }

    private createStepper(
        titleText: string,
        getValue: () => number,
        setValue: (v: number) => void,
        options?: { min?: number; max?: number },
    ): Container {
        const container = new Container();

        const min = options?.min ?? 1;
        const max = options?.max;

        const title = new Text({
            text: titleText,
            style: TextStyles.buttonText,
        });
        title.anchor.set(0.5);
        title.y = -90;

        const bg = new Graphics()
            .roundRect(-150, -50, 300, 100, UI.cornerRadius)
            .fill(UI.buttonColor);

        const valueText = new Text({
            text: String(getValue()),
            style: TextStyles.buttonText,
        });
        valueText.anchor.set(0.5);

        const minusBtn = this.createSmallButton("-", () => {
            const next = Math.max(min, getValue() - 1);
            setValue(next);
            valueText.text = String(next);
            updateButtons();
        });

        const plusBtn = this.createSmallButton("+", () => {
            const next = max !== undefined
                ? Math.min(max, getValue() + 1)
                : getValue() + 1;

            setValue(next);
            valueText.text = String(next);
            updateButtons();
        });

        const buttonX = (bg.width * 0.8 - minusBtn.width) / 2;
        minusBtn.position.set(-buttonX, 0);
        plusBtn.position.set(buttonX, 0);

        const setDisabled = (btn: Container, disabled: boolean) => {
            btn.eventMode = disabled ? "none" : "static";
            btn.cursor = disabled ? "default" : "pointer";
            btn.alpha = disabled ? 0.4 : 1;
        };

        const updateButtons = () => {
            const value = getValue();

            setDisabled(minusBtn, value <= min);

            setDisabled(plusBtn, max !== undefined && value >= max);
        };

        updateButtons();

        container.addChild(title, bg, valueText, minusBtn, plusBtn);
        return container;
    }

    private createSmallButton(
        labelText: string,
        onClick: () => void,
    ): Container {
        const container = new Container();
        container.eventMode = "static";
        container.cursor = "pointer";

        const label = new Text({
            text: labelText,
            style: TextStyles.buttonText,
        });
        label.anchor.set(0.5);

        const bg = new Graphics()
            .roundRect(-30, -30, 60, 60, UI.cornerRadius)
            .fill(UI.buttonHoverColor);

        container.addChild(bg, label);

        container.on("pointerup", onClick);
        container.on("pointerover", () => (bg.tint = 0xdddddd));
        container.on("pointerout", () => (bg.tint = 0xffffff));

        return container;
    }


    private createStartButton(w: number, h: number) {
        const container = new Container();
        container.eventMode = "static";
        container.cursor = "pointer";

        const label = new Text({
            text: "Start",
            style: TextStyles.buttonText,
        });
        label.anchor.set(0.5);

        const bg = new Graphics()
            .roundRect(
                -(label.width + UI.buttonPadding) / 2,
                -(label.height + UI.buttonPadding) / 2,
                label.width + UI.buttonPadding,
                label.height + UI.buttonPadding,
                UI.cornerRadius,
            )
            .fill(UI.buttonColor);

        container.addChild(bg, label);

        container.position.set(w / 2, h / 2 + 500);

        container.on("pointerover", () => {
            bg.tint = UI.buttonHoverColor;
        });

        container.on("pointerout", () => {
            bg.tint = 0xffffff;
        });

        container.on("pointerup", () => {
            signal.dispatch(EVENTS.LOAD_SCENE, {
                type: "LEVEL",
                payload: {
                    floors: this.floorValue,
                    liftCapacity: this.liftCapacityValue,
                },
            });
        });

        this.addChild(container);
    }


    resize(stageConfig: any) {
        this.x = stageConfig.width / 2;
        this.y = stageConfig.height / 2;
    }
}