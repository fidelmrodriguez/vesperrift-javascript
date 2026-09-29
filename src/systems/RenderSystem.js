import { Graphics } from 'pixi.js';
import { WORLD } from '../core/constants.js';

export class RenderSystem {
  constructor(worldLayer) {
    this.worldLayer = worldLayer;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.grid = new Graphics();
    this.grid.zIndex = 0;
    this.worldLayer.addChild(this.grid);
    this.drawArenaGrid();
  }

  drawArenaGrid() {
    const g = this.grid;
    g.clear();
    // Sparse navigation beacons leave the deep-space scene visible.
    g.rect(0, 0, WORLD.width, WORLD.height).stroke({ width: 3, color: 0x65d9ff, alpha: 0.25 });
    g.rect(12, 12, WORLD.width - 24, WORLD.height - 24).stroke({ width: 1, color: 0x65d9ff, alpha: 0.1 });
    for (let x = 120; x < WORLD.width; x += 240) {
      for (let y = 120; y < WORLD.height; y += 240) {
        g.moveTo(x - 4, y).lineTo(x + 4, y).moveTo(x, y - 4).lineTo(x, y + 4).stroke({ width: 1, color: 0xa0c9ed, alpha: 0.15 });
      }
    }
    for (let x = 0; x <= WORLD.width; x += 120) {
      for (const y of [8, WORLD.height - 8]) g.rect(x, y - 2, 28, 4).fill({ color: 0x6edbff, alpha: 0.5 });
    }
  }

  updateVisuals(player, enemies, pickups, time) {
    if (this.reducedMotion.matches) time = 0;
    if (player.visualAimAngle !== undefined) player.aim.rotation = player.visualAimAngle;
    const thrust = Math.min(1, Math.hypot(player.vx, player.vy) / player.speed);
    player.engine.scale.x = 0.8 + thrust * 0.4 + Math.sin(time * 37) * 0.08 + (player.dashTimer > 0 ? 1.2 : 0);
    player.engine.alpha = 0.65 + thrust * 0.35;
    enemies.forEach((enemy) => {
      const pulse = Math.sin(time * 24 + enemy.x * 0.04);
      enemy.ring.scale.x = 0.95 + pulse * 0.09 + (enemy.chargeTimer > 0 ? 1 : 0);
      enemy.ring.alpha = enemy.chargeTimer > 0 ? 1 : 0.75;
    });
    pickups.forEach((pickup) => {
      pickup.display.scale.set(1 + Math.sin(time * 3 + pickup.x) * 0.1);
      pickup.display.rotation = Math.sin(time * 1.5 + pickup.y) * 0.2;
    });
  }

  updateCamera(camera) {
    this.worldLayer.position.set(-camera.x, -camera.y);
  }
}
