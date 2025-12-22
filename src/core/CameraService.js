"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraService = void 0;
const pixi_js_1 = require("pixi.js");
const signals_1 = require("../../assets/configs/signals");
const SignalService_1 = require("./SignalService");
class CameraService {
    app;
    target = null;
    cameraContainer;
    smoothness = 1;
    offsetX = 0;
    offsetY = 0;
    enabled = false;
    currentScale = 1;
    parallaxLayers = [];
    defaultZoom = 1;
    isZoomed = false;
    activeZoomTween = null;
    constructor(app, cameraContainer) {
        this.app = app;
        this.cameraContainer = cameraContainer;
    }
    play() {
        this.reset();
        SignalService_1.signal.on(signals_1.EVENTS.APP_UPDATE, this.update);
        SignalService_1.signal.on(signals_1.EVENTS.CAMERA_FOLLOW, this.setTarget);
        SignalService_1.signal.on(signals_1.EVENTS.CAMERA_ZOOM, this.onZoomRequest);
    }
    reset() {
        SignalService_1.signal.off(signals_1.EVENTS.APP_UPDATE, this.update);
        SignalService_1.signal.off(signals_1.EVENTS.CAMERA_FOLLOW, this.setTarget);
        SignalService_1.signal.off(signals_1.EVENTS.CAMERA_ZOOM, this.onZoomRequest);
        this.clear();
    }
    destroy() {
        this.reset();
        this.target = null;
    }
    clear() {
        this.cameraContainer.position.set(0, 0);
        this.cameraContainer.pivot.set(0, 0);
        this.cameraContainer.scale.set(1);
        this.currentScale = 1;
    }
    setTarget(target, snap = false) {
        this.target = target;
        if (target && snap) {
            this.snapToTarget();
        }
        console.log(`[Camera] setTarget: ${target ? target.name || 'container' : 'null'}, snap: ${snap}`);
    }
    addParallaxLayer(container, factor) {
        this.parallaxLayers.push({ container, factor });
    }
    clearParallaxLayers() {
        this.parallaxLayers = [];
    }
    setOffset(x, y) {
        this.offsetX = x;
        this.offsetY = y;
    }
    tweenOffset(x, y, duration = 500) {
        const offsetObj = { x: this.offsetX, y: this.offsetY };
        gsap.to(this, {
            offsetX: x,
            offsetY: y,
            duration: duration / 1000,
            ease: 'sine.inOut',
        });
    }
    setSmoothness(value) {
        this.smoothness = Math.max(0.01, Math.min(1, value));
    }
    enable() {
        this.enabled = true;
        console.log('[Camera] enabled');
    }
    snapToTarget() {
        if (!this.target)
            return;
        const globalPos = this.target.getGlobalPosition();
        const localPos = this.cameraContainer.toLocal(globalPos, undefined, undefined, true);
        const desiredPivotX = localPos.x - this.offsetX / this.currentScale;
        const desiredPivotY = localPos.y - this.offsetY / this.currentScale;
        this.cameraContainer.pivot.set(desiredPivotX, desiredPivotY);
        const centerX = this.app.width * 0.5;
        const centerY = this.app.height * 0.5;
        this.cameraContainer.position.set(centerX, centerY);
    }
    disable() {
        this.enabled = false;
        console.log('[Camera] disabled');
    }
    resize(width, height, scale) {
        if (this.enabled && this.target) {
            this.update();
        }
    }
    zoomIn(targetScale, duration, callback) {
        this.zoomTo(targetScale, duration, callback);
    }
    zoomOut(targetScale, duration, callback) {
        this.zoomTo(targetScale, duration, callback);
    }
    zoomToPoint(x, y, targetScale, duration, callback) {
        const localPos = this.cameraContainer.toLocal(new pixi_js_1.Point(x, y));
        const pivotObj = { x: this.cameraContainer.pivot.x, y: this.cameraContainer.pivot.y };
        const scaleObj = { value: this.currentScale };
        this.app.tweens
            .add(pivotObj)
            .to({ x: localPos.x, y: localPos.y })
            .duration(duration)
            .easing(Easing.Sinusoidal.Out)
            .onUpdate(() => {
            this.cameraContainer.pivot.set(pivotObj.x, pivotObj.y);
        })
            .start();
        this.app.tweens
            .add(scaleObj)
            .to({ value: targetScale })
            .duration(duration)
            .easing(Easing.Sinusoidal.Out)
            .onUpdate(() => {
            this.currentScale = scaleObj.value;
            this.cameraContainer.scale.set(scaleObj.value);
        })
            .onComplete(() => callback?.())
            .start();
    }
    update(delta = 16) {
        if (!this.enabled || !this.target)
            return;
        const dt = delta / 16.67;
        const globalPos = this.target.getGlobalPosition();
        const localPos = this.cameraContainer.toLocal(globalPos, undefined, undefined, true);
        const desiredPivotX = localPos.x - this.offsetX / this.currentScale;
        const desiredPivotY = localPos.y - this.offsetY / this.currentScale;
        const lerpFactor = 1 - Math.pow(1 - this.smoothness, dt);
        const deltaX = (desiredPivotX - this.cameraContainer.pivot.x) * lerpFactor;
        const deltaY = (desiredPivotY - this.cameraContainer.pivot.y) * lerpFactor;
        this.cameraContainer.pivot.x += deltaX;
        this.cameraContainer.pivot.y += deltaY;
        for (const layer of this.parallaxLayers) {
            layer.container.x -= deltaX * (1 - layer.factor);
            layer.container.y -= deltaY * (1 - layer.factor);
        }
        const centerX = this.app.width * 0.5;
        const centerY = this.app.height * 0.5;
        this.cameraContainer.position.set(centerX, centerY);
    }
    // --- Zoom Logic ---
    zoomTo(targetScale, duration, callback) {
        console.log(`[Camera] zoomTo: ${this.currentScale.toFixed(2)} -> ${targetScale}, duration: ${duration}ms`);
        if (this.activeZoomTween) {
            this.activeZoomTween.kill();
            this.activeZoomTween = null;
        }
        this.activeZoomTween = gsap.to(this, {
            currentScale: targetScale,
            duration: duration / 1000,
            ease: 'sine.inOut',
            onUpdate: () => {
                this.cameraContainer.scale.set(this.currentScale);
            },
            onComplete: () => {
                this.activeZoomTween = null;
                callback?.();
            },
        });
    }
    zoomTween(targetScale, duration = 600, callback) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const worldCenter = this.cameraContainer.toLocal(new pixi_js_1.Point(centerX, centerY));
        this.cameraContainer.pivot.set(worldCenter.x, worldCenter.y);
        this.cameraContainer.position.set(centerX, centerY);
        gsap.to(this.cameraContainer.scale, {
            x: targetScale,
            y: targetScale,
            duration: duration / 1000,
            ease: 'sine.inOut',
            onComplete: callback,
        });
        this.currentScale = targetScale;
    }
    onZoomRequest = (scale) => {
        this.zoomTo(scale, 600);
    };
    zoomToTarget(target, zoomLevel = 1.5, duration = 800, callback) {
        if (this.isZoomed)
            return;
        this.isZoomed = true;
        this.setTarget(target);
        this.enable();
        this.setSmoothness(0);
        this.zoomIn(zoomLevel, duration, callback);
    }
    zoomToHook(zoomLevel = 1.5, duration = 800, callback) {
        if (!this.app.fishingService?.character?.hookContainer)
            return;
        this.zoomToTarget(this.app.fishingService.character.hookContainer, zoomLevel, duration, callback);
    }
    resetZoom(duration = 600, callback) {
        if (!this.isZoomed)
            return;
        this.zoomOut(this.defaultZoom, duration, () => {
            this.disable();
            this.setTarget(null);
            this.isZoomed = false;
            callback?.();
        });
    }
    setDefaultZoom(zoom) {
        this.defaultZoom = zoom;
    }
    getDefaultZoom() {
        return this.defaultZoom;
    }
    isZoomActive() {
        return this.isZoomed;
    }
}
exports.CameraService = CameraService;
