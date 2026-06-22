import { Graphics } from 'pixi.js';

export function createPickup(x, y, value = 12) {
  const display = new Graphics()
    .circle(0, 0, 7)
    .fill(0x34d399)
    .stroke({ width: 2, color: 0xd1fae5, alpha: 0.72 });
  display.zIndex = 5;

  return {
    kind: 'pickup',
    x,
    y,
    value,
    radius: 14,
    display
  };
}
