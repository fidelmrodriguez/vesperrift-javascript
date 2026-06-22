import { Graphics } from 'pixi.js';

export function createProjectile() {
  const display = new Graphics()
    .circle(0, 0, 6)
    .fill(0xe0f2fe)
    .stroke({ width: 2, color: 0x38bdf8, alpha: 0.9 });
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
  projectile.display.visible = true;
  projectile.display.alpha = 1;
}
