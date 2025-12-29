import { Ticker } from "pixi.js";

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    let elapsed = 0;

    const tick = (ticker: Ticker) => {
      elapsed += ticker.deltaMS;

      if (elapsed >= ms) {
        Ticker.shared.remove(tick);
        resolve();
      }
    };

    Ticker.shared.add(tick);
  });
}
