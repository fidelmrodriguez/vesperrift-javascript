import { Container, Graphics } from 'pixi.js';
import { PLAYER_DEFAULTS, WORLD } from '../core/constants.js';
import { createCollider, createHealth, createKinematics, createTransform } from '../components/entityComponents.js';

export function createPlayer() {
  const container = new Container();
  const body = new Graphics()
    .circle(0, 0, PLAYER_DEFAULTS.radius)
    .fill(0x7dd3fc)
    .stroke({ width: 3, color: 0xe0f2fe, alpha: 0.85 });
  const aim = new Graphics()
    .moveTo(0, 0)
    .lineTo(36, 0)
    .stroke({ width: 5, color: 0xffffff, alpha: 0.75 });
  const core = new Graphics()
    .circle(0, 0, 8)
    .fill(0x0f172a);

  container.addChild(body, aim, core);
  container.zIndex = 20;

  return {
    kind: 'player',
    ...createTransform(WORLD.width / 2, WORLD.height / 2),
    ...createKinematics(),
    ...createCollider(PLAYER_DEFAULTS.radius),
    ...createHealth(PLAYER_DEFAULTS.hp),
    speed: PLAYER_DEFAULTS.speed,
    fireRate: PLAYER_DEFAULTS.fireRate,
    fireCooldown: 0,
    bulletSpeed: PLAYER_DEFAULTS.bulletSpeed,
    damage: PLAYER_DEFAULTS.damage,
    dashSpeed: PLAYER_DEFAULTS.dashSpeed,
    dashDuration: PLAYER_DEFAULTS.dashDuration,
    dashCooldown: PLAYER_DEFAULTS.dashCooldown,
    dashTimer: 0,
    dashCooldownTimer: 0,
    invulnerableTimer: 0,
    projectileCount: PLAYER_DEFAULTS.projectileCount,
    pierce: PLAYER_DEFAULTS.pierce,
    explosionRadius: PLAYER_DEFAULTS.explosionRadius,
    xp: 0,
    xpToLevel: 80,
    level: 1,
    score: 0,
    aimAngle: 0,
    display: container,
    body,
    aim
  };
}

export function resetPlayer(player) {
  Object.assign(player, {
    x: WORLD.width / 2,
    y: WORLD.height / 2,
    vx: 0,
    vy: 0,
    radius: PLAYER_DEFAULTS.radius,
    hp: PLAYER_DEFAULTS.hp,
    maxHp: PLAYER_DEFAULTS.hp,
    speed: PLAYER_DEFAULTS.speed,
    fireRate: PLAYER_DEFAULTS.fireRate,
    fireCooldown: 0,
    bulletSpeed: PLAYER_DEFAULTS.bulletSpeed,
    damage: PLAYER_DEFAULTS.damage,
    dashSpeed: PLAYER_DEFAULTS.dashSpeed,
    dashDuration: PLAYER_DEFAULTS.dashDuration,
    dashCooldown: PLAYER_DEFAULTS.dashCooldown,
    dashTimer: 0,
    dashCooldownTimer: 0,
    invulnerableTimer: 0,
    projectileCount: PLAYER_DEFAULTS.projectileCount,
    pierce: PLAYER_DEFAULTS.pierce,
    explosionRadius: PLAYER_DEFAULTS.explosionRadius,
    xp: 0,
    xpToLevel: 80,
    level: 1,
    score: 0,
    aimAngle: 0
  });
  player.display.alpha = 1;
  player.display.visible = true;
}
