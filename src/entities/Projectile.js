import { Graphics } from 'pixi.js';

export function createProjectile() {
  const display = new Graphics();
  display.zIndex = 30;

  return {
    kind: 'projectile',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 6,
    damage: 0,
    life: 0,
    pierceLeft: 0,
    explosionRadius: 0,
    hits: new Set(),
    display
  };
}

export function resetProjectile(projectile, payload) {
  Object.assign(projectile, payload, { owner: payload.owner ?? 'player', life: payload.life ?? 1.4 });
  projectile.hits.clear();
  const color = projectile.owner === 'enemy' ? 0xffaf57 : 0x71e8ff;
  projectile.display.clear()
    .ellipse(-5, 0, 15, 6).fill({ color, alpha: 0.1 })
    .poly([-22, 0, 0, -3, 6, 0, 0, 3]).fill({ color, alpha: 0.5 })
    .roundRect(-6, -2, 12, 4, 2).fill(color)
    .roundRect(-3, -1, 8, 2, 1).fill(0xffffff);
  projectile.display.rotation = Math.atan2(projectile.vy, projectile.vx);
  projectile.display.visible = true;
  projectile.display.alpha = 1;
}
