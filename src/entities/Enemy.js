import { Container, Graphics } from 'pixi.js';
import { drawShip } from '../visuals/shipArt.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { createCollider, createHealth, createKinematics, createTransform } from '../components/entityComponents.js';

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
  drawShip(body, ring, type, radius);
}
