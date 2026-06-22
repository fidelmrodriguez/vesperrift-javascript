import { Container, Graphics } from 'pixi.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { createCollider, createHealth, createKinematics, createTransform } from '../components/entityComponents.js';

const COLORS = {
  melee: 0xfb7185,
  ranged: 0xfacc15,
  charger: 0xc084fc
};

export function createEnemy(type, x, y, wave = 1) {
  const config = ENEMY_TYPES[type];
  const container = new Container();
  const body = new Graphics();
  const ring = new Graphics();
  drawEnemy(body, ring, type, config.radius);
  container.addChild(ring, body);
  container.zIndex = 10;

  return {
    kind: 'enemy',
    type,
    state: 'chase',
    ...createTransform(x, y),
    ...createKinematics(),
    ...createCollider(config.radius),
    ...createHealth(config.hp + wave * config.hpScale),
    speed: config.speed + wave * 1.2,
    damage: config.damage,
    xpValue: config.xpValue,
    attackCooldown: 0,
    chargeCooldown: 1.4,
    chargeTimer: 0,
    flashTimer: 0,
    display: container,
    body,
    ring
  };
}

export function recycleEnemy(enemy, type, x, y, wave = 1) {
  const config = ENEMY_TYPES[type];
  Object.assign(enemy, {
    type,
    state: 'chase',
    ...createTransform(x, y),
    ...createKinematics(),
    ...createCollider(config.radius),
    ...createHealth(config.hp + wave * config.hpScale),
    speed: config.speed + wave * 1.2,
    damage: config.damage,
    xpValue: config.xpValue,
    attackCooldown: 0,
    chargeCooldown: 1.4,
    chargeTimer: 0,
    flashTimer: 0
  });
  enemy.display.visible = true;
  enemy.display.alpha = 1;
  drawEnemy(enemy.body, enemy.ring, type, config.radius);
}

function drawEnemy(body, ring, type, radius) {
  body.clear();
  ring.clear();
  ring.circle(0, 0, radius + 5).stroke({ width: 2, color: COLORS[type], alpha: 0.28 });

  if (type === 'charger') {
    body.moveTo(radius, 0).lineTo(-radius * 0.75, radius * 0.72).lineTo(-radius * 0.52, 0).lineTo(-radius * 0.75, -radius * 0.72).closePath().fill(COLORS[type]);
    body.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
    return;
  }

  if (type === 'ranged') {
    body.rect(-radius, -radius, radius * 2, radius * 2).fill(COLORS[type]);
    body.stroke({ width: 2, color: 0xffffff, alpha: 0.45 });
    return;
  }

  body.circle(0, 0, radius).fill(COLORS[type]);
  body.stroke({ width: 2, color: 0xffffff, alpha: 0.45 });
}
