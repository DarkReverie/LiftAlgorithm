import { Container, Point, Graphics } from 'pixi.js';
import {Game} from "./Game";
import {EVENTS} from "../../assets/configs/signals";
import {signal} from "./SignalService";
import { Tween, Easing } from "@tweenjs/tween.js";
import { tweenGroup } from "./tweenGroupUtility";

export class CameraService {
  private app: Game;
  private target: Container | null = null;
  private cameraContainer: Container;
  private smoothness = 1;
  private offsetX = 0;
  private offsetY = 0;
  private enabled = false;
  private currentScale = 1;
  private parallaxLayers: { container: Container; factor: number }[] = [];


  private defaultZoom: number = 1;
  private isZoomed: boolean = false;
  private activeZoomTween: any = null;

  constructor(app: Game, cameraContainer: Container) {
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




  public destroy(): void {
    this.reset();
    this.target = null;
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
    console.log(`[Camera] setTarget: ${target ? target.name || 'container' : 'null'}, snap: ${snap}`);
  }
    private onFollow = ({ target, snap }: { target: Container; snap?: boolean }) => {
        this.setTarget(target, snap);
        this.enable();
    };

    private onStop = () => {
        this.disable();
        this.setTarget(null);
    };

  public setSmoothness(value: number): void {
    this.smoothness = Math.max(0.01, Math.min(1, value));
  }

  public enable(): void {
    this.enabled = true;
    console.log('[Camera] enabled');
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
    console.log('[Camera] disabled');
  }

  public resize(width: number, height: number, scale: number): void {
    if (this.enabled && this.target) {
      this.update();
    }
  }

  public zoomIn(targetScale: number, duration: number, callback?: () => void): void {
    this.zoomTo(targetScale, duration, callback);
  }

  public zoomOut(targetScale: number, duration: number, callback?: () => void): void {
    this.zoomTo(targetScale, duration, callback);
  }



    public update = (delta: number = 16): void => {
        if (!this.enabled || !this.target) return;

        const dt = delta / 16.67;

        const globalPos = this.target.getGlobalPosition();

        const localPos = this.cameraContainer.toLocal(globalPos);

        const desiredPivotX = localPos.x;
        const desiredPivotY = localPos.y;

        const lerpFactor = 1 - Math.pow(1 - this.smoothness, dt);

        this.cameraContainer.pivot.x +=
            (desiredPivotX - this.cameraContainer.pivot.x) * lerpFactor;

        this.cameraContainer.pivot.y +=
            (desiredPivotY - this.cameraContainer.pivot.y) * lerpFactor;

        const renderer = this.app.app.renderer;
        const { top, bottom } = this.getVisibleWorldBounds();

        this.cameraContainer.position.set(
            renderer.width * 0.5 - 700,
            renderer.height * 0.5 + 500
        );
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

    public getVisibleWorldBounds(): { top: number; bottom: number } {
        const renderer = this.app.app.renderer;

        const topLeft = this.cameraContainer.toLocal(
            new Point(0, 0)
        );
        const bottomRight = this.cameraContainer.toLocal(
            new Point(renderer.width, renderer.height)
        );

        return {
            top: topLeft.y,
            bottom: bottomRight.y,
        };
    }

  private onZoomRequest = (scale: number): void => {
    this.zoomTo(scale, 500);
  };

  public zoomToTarget(target: Container, zoomLevel: number = 1.5, duration: number = 800, callback?: () => void): void {
    if (this.isZoomed) return;

    this.isZoomed = true;
    this.setTarget(target);
    this.enable();
    this.setSmoothness(0);
    this.zoomIn(zoomLevel, duration, callback);
  }

  public resetZoom(duration: number = 600, callback?: () => void): void {
    if (!this.isZoomed) return;

    this.zoomOut(this.defaultZoom, duration, () => {
      this.disable();
      this.setTarget(null);
      this.isZoomed = false;
      callback?.();
    });
  }

  public setDefaultZoom(zoom: number): void {
    this.defaultZoom = zoom;
  }

  public getDefaultZoom(): number {
    return this.defaultZoom;
  }

  public isZoomActive(): boolean {
    return this.isZoomed;
  }
}
