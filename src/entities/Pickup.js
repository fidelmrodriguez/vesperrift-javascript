import { Graphics } from 'pixi.js';

export function createPickup(x, y, value = 12) {
  const display = new Graphics()
    .circle(0, 0, 13).fill({ color: 0x34ffc0, alpha: 0.06 })
    .poly([0, -8, 6, 0, 0, 8, -6, 0]).fill(0x125d60).stroke({ width: 1, color: 0x68ffd0, alpha: 0.85 })
    .poly([0, -6, 0, 6, -4, 0]).fill(0x67ffd4)
    .poly([0, -6, 4, 0, 0, 2]).fill(0xd2fff3);
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
