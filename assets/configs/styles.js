"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI = exports.TextStyles = void 0;
const pixi_js_1 = require("pixi.js");
exports.TextStyles = {
    buttonText: new pixi_js_1.TextStyle({
        fontSize: 68,
        fill: 0xffffff,
        fontWeight: "bold",
        align: "center",
    }),
    popupTitleWin: new pixi_js_1.TextStyle({
        fontSize: 48,
        fill: 0x00ff00,
        fontWeight: "bold",
        align: "center",
    }),
    popupTitleLose: new pixi_js_1.TextStyle({
        fontSize: 48,
        fill: 0xff4444,
        fontWeight: "bold",
        align: "center",
    }),
    popupButtonText: new pixi_js_1.TextStyle({
        fontSize: 48,
        fill: 0xffffff,
        fontWeight: "bold",
        align: "center"
    }),
    counterText: new pixi_js_1.TextStyle({
        fontSize: 140,
        fill: 0xffffff,
        fontWeight: "bold",
        align: "center",
    }),
    enemyCounterTitle: new pixi_js_1.TextStyle({
        fontSize: 140,
        fill: "#ffcc00",
        fontWeight: "bold",
    })
};
exports.UI = {
    buttonPadding: 40,
    cornerRadius: 20,
    buttonColor: 0x2c2d2d,
    buttonHoverColor: 0x6a7070,
};
