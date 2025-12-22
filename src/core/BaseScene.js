"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScene = void 0;
const pixi_js_1 = require("pixi.js");
const gsap_1 = __importDefault(require("gsap"));
class BaseScene extends pixi_js_1.Container {
    async init() { }
    resize(stageConfig) {
    }
    destroy(options) {
        gsap_1.default.killTweensOf(this);
        super.destroy({ children: true });
    }
}
exports.BaseScene = BaseScene;
