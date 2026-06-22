import { clamp } from './random.js';
import { WORLD } from './constants.js';

export class Camera {
  constructor(viewport) {
    this.viewport = viewport;
    this.x = 0;
    this.y = 0;
    this.shakeTime = 0;
    this.shakePower = 0;
  }

  resize(width, height) {
    this.viewport.width = width;
    this.viewport.height = height;
  }

  follow(target, dt) {
    const desiredX = clamp(target.x - this.viewport.width / 2, 0, Math.max(0, WORLD.width - this.viewport.width));
    const desiredY = clamp(target.y - this.viewport.height / 2, 0, Math.max(0, WORLD.height - this.viewport.height));
    const smoothing = 1 - Math.pow(0.001, dt);
    this.x += (desiredX - this.x) * smoothing;
    this.y += (desiredY - this.y) * smoothing;

    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      this.x += (Math.random() - 0.5) * this.shakePower;
      this.y += (Math.random() - 0.5) * this.shakePower;
    }
  }

  shake(power = 8, duration = 0.12) {
    this.shakePower = power;
    this.shakeTime = duration;
  }
}
