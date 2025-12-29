import { Container } from "pixi.js";
import { Tween, Easing } from "@tweenjs/tween.js";

import { EVENTS } from "../../../assets/configs/signals";
import { Game } from "../base/Game";
import { tweenGroup } from "../utils/tweenGroupUtility";

import { signal } from "./SignalService";

export class CameraService {
  private app!: Game;
  private static instance: CameraService;
  private target: Container | null = null;
  private cameraContainer!: Container;
  private smoothness = 1;
  private offsetX = 0;
  private offsetY = 0;
  private enabled = false;
  private currentScale = 1;

  private activeZoomTween: any = null;

  constructor() {}

  static getInstance(): CameraService {
    if (!this.instance) {
      this.instance = new CameraService();
    }
    return this.instance;
  }

  init(app: Game, cameraContainer: Container) {
    this.app = app;
    this.cameraContainer = cameraContainer;
  }
  public play(): void {
    this.reset();

    signal.on(EVENTS.APP_UPDATE, this.update);
    signal.on(EVENTS.CAMERA_FOLLOW, this.onFollow);
    signal.on(EVENTS.CAMERA_STOP, this.onStop);
    signal.on(EVENTS.CAMERA_ZOOM, this.onZoomRequest);
  }

  public reset(): void {
    signal.off(EVENTS.APP_UPDATE, this.update);
    signal.off(EVENTS.CAMERA_FOLLOW, this.setTarget);
    signal.off(EVENTS.CAMERA_ZOOM, this.onZoomRequest);
    signal.off(EVENTS.CAMERA_FOLLOW, this.onFollow);
    signal.off(EVENTS.CAMERA_STOP, this.onStop);

    this.clear();
  }

  public clear(): void {
    this.cameraContainer.position.set(0, 0);
    this.cameraContainer.pivot.set(0, 0);
    this.cameraContainer.scale.set(1);
    this.currentScale = 1;
  }

  public setTarget(target: Container | null, snap: boolean = false): void {
    this.target = target;
    if (target && snap) {
      this.snapToTarget();
    }
    console.log(
      `[Camera] setTarget: ${target ? target.name || "container" : "null"}, snap: ${snap}`,
    );
  }
  private onFollow = ({ target, snap }: { target: Container; snap?: boolean }) => {
    this.setTarget(target, snap);
    this.enable();
  };

  private onStop = () => {
    this.disable();
    this.setTarget(null);
  };

  public enable(): void {
    this.enabled = true;
    console.log("[Camera] enabled");
  }

  public snapToTarget(): void {
    if (!this.target) return;

    const globalPos = this.target.getGlobalPosition();
    const localPos = this.cameraContainer.toLocal(globalPos, undefined, undefined, true);

    const desiredPivotX = localPos.x - this.offsetX / this.currentScale;
    const desiredPivotY = localPos.y - this.offsetY / this.currentScale;

    this.cameraContainer.pivot.set(desiredPivotX, desiredPivotY);

    const centerX = this.app.app.renderer.width * 0.5;
    const centerY = this.app.app.renderer.height * 0.5;
    this.cameraContainer.position.set(centerX, centerY);
  }

  public disable(): void {
    this.enabled = false;
    console.log("[Camera] disabled");
  }

  public update = (delta: number = 16): void => {
    if (!this.enabled || !this.target) return;

    const dt = delta / 16.67;
    const globalPos = this.target.getGlobalPosition();

    const localPos = this.cameraContainer.toLocal(globalPos);

    const desiredPivotX = localPos.x;
    const desiredPivotY = localPos.y;
    const lerpFactor = 1 - Math.pow(1 - this.smoothness, dt);

    this.cameraContainer.pivot.x += (desiredPivotX - this.cameraContainer.pivot.x) * lerpFactor;

    this.cameraContainer.pivot.y += (desiredPivotY - this.cameraContainer.pivot.y) * lerpFactor;

    const renderer = this.app.app.renderer;
    const camX = renderer.width * 0.5 - 700;
    const camY = renderer.height * 0.5 + 500;
    this.cameraContainer.position.set(camX, camY);
  };

  public zoomTo(targetScale: number, duration: number, callback?: () => void): void {
    if (this.activeZoomTween) {
      this.activeZoomTween.stop();
      this.activeZoomTween = null;
    }

    const state = { scale: this.currentScale };

    this.activeZoomTween = new Tween(state, tweenGroup)
      .to({ scale: targetScale }, duration)
      .easing(Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        this.currentScale = state.scale;
        this.cameraContainer.scale.set(this.currentScale);
      })
      .onComplete(() => {
        this.activeZoomTween = null;
        callback?.();
      })
      .start();
  }

  private onZoomRequest = (scale: number): void => {
    this.zoomTo(scale, 500);
  };
}
