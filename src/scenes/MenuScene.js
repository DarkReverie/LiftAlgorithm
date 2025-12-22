"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuScene = void 0;
const BaseScene_1 = require("../core/BaseScene");
const pixi_js_1 = require("pixi.js");
const stages_1 = require("../../assets/configs/stages");
const AssetService_1 = require("../core/AssetService");
const SignalService_1 = require("../core/SignalService");
const signals_1 = require("../../assets/configs/signals");
const styles_1 = require("../../assets/configs/styles");
class MenuScene extends BaseScene_1.BaseScene {
    floorValue = 1;
    liftCapacityValue = 1;
    constructor() {
        super();
        this.init();
    }
    async init() {
        const designW = stages_1.view.screen.land.width;
        const designH = stages_1.view.screen.land.height;
        await this.createBackground(designW, designH);
        this.createTitle(designW, designH);
        this.createControls(designW, designH);
        this.createStartButton(designW, designH);
        this.position.set(designW / 2, designH / 2);
        this.pivot.set(designW / 2, designH / 2);
    }
    async createBackground(w, h) {
        const bgTexture = await AssetService_1.AssetService.getTexture('main_menu');
        const bg = new pixi_js_1.Sprite(bgTexture);
        bg.anchor.set(0.5, 0.5);
        bg.scale.set(2);
        bg.position.set(w / 2, h / 2);
        this.addChild(bg);
    }
    createTitle(w, h) {
        const title = new pixi_js_1.Text({
            text: "Choose floor number\n and lift capacity",
            style: styles_1.TextStyles.buttonText,
        });
        title.anchor.set(0.5);
        title.position.set(w / 2, h / 2 - 200);
        this.addChild(title);
    }
    createControls(w, h) {
        const controls = new pixi_js_1.Container();
        const floorControl = this.createStepper("Floor number", () => this.floorValue, (v) => (this.floorValue = v));
        const liftControl = this.createStepper("Lift capacity", () => this.liftCapacityValue, (v) => (this.liftCapacityValue = v));
        floorControl.position.set(w / 2, h / 2 + 100);
        liftControl.position.set(w / 2, h / 2 + 300);
        controls.addChild(floorControl, liftControl);
        this.addChild(controls);
    }
    createStepper(titleText, getValue, setValue) {
        const container = new pixi_js_1.Container();
        const title = new pixi_js_1.Text({
            text: titleText,
            style: styles_1.TextStyles.buttonText,
        });
        title.anchor.set(0.5);
        title.y = -90;
        const bg = new pixi_js_1.Graphics()
            .roundRect(-150, -50, 300, 100, styles_1.UI.cornerRadius)
            .fill(styles_1.UI.buttonColor);
        const valueText = new pixi_js_1.Text({
            text: String(getValue()),
            style: styles_1.TextStyles.buttonText,
        });
        valueText.anchor.set(0.5);
        const minusBtn = this.createSmallButton("-", () => {
            const next = Math.max(1, getValue() - 1);
            setValue(next);
            valueText.text = String(next);
        });
        const plusBtn = this.createSmallButton("+", () => {
            const next = getValue() + 1;
            setValue(next);
            valueText.text = String(next);
        });
        const buttonX = (bg.width * 0.8 - minusBtn.width) / 2;
        minusBtn.position.set(-buttonX, 0);
        plusBtn.position.set(buttonX, 0);
        container.addChild(title, bg, valueText, minusBtn, plusBtn);
        return container;
    }
    createSmallButton(labelText, onClick) {
        const container = new pixi_js_1.Container();
        container.eventMode = "static";
        container.cursor = "pointer";
        const label = new pixi_js_1.Text({
            text: labelText,
            style: styles_1.TextStyles.buttonText,
        });
        label.anchor.set(0.5);
        const bg = new pixi_js_1.Graphics()
            .roundRect(-30, -30, 60, 60, styles_1.UI.cornerRadius)
            .fill(styles_1.UI.buttonHoverColor);
        container.addChild(bg, label);
        container.on("pointerup", onClick);
        container.on("pointerover", () => (bg.tint = 0xdddddd));
        container.on("pointerout", () => (bg.tint = 0xffffff));
        return container;
    }
    createStartButton(w, h) {
        const container = new pixi_js_1.Container();
        container.eventMode = "static";
        container.cursor = "pointer";
        const label = new pixi_js_1.Text({
            text: "Start",
            style: styles_1.TextStyles.buttonText,
        });
        label.anchor.set(0.5);
        const bg = new pixi_js_1.Graphics()
            .roundRect(-(label.width + styles_1.UI.buttonPadding) / 2, -(label.height + styles_1.UI.buttonPadding) / 2, label.width + styles_1.UI.buttonPadding, label.height + styles_1.UI.buttonPadding, styles_1.UI.cornerRadius)
            .fill(styles_1.UI.buttonColor);
        container.addChild(bg, label);
        container.position.set(w / 2, h / 2 + 500);
        container.on("pointerover", () => {
            bg.tint = styles_1.UI.buttonHoverColor;
        });
        container.on("pointerout", () => {
            bg.tint = 0xffffff;
        });
        container.on("pointerup", () => {
            SignalService_1.signal.dispatch(signals_1.EVENTS.LOAD_SCENE, {
                type: "LEVEL",
                payload: {
                    floors: this.floorValue,
                    liftCapacity: this.liftCapacityValue,
                },
            });
        });
        this.addChild(container);
    }
    resize(stageConfig) {
        this.x = stageConfig.width / 2;
        this.y = stageConfig.height / 2;
    }
}
exports.MenuScene = MenuScene;
