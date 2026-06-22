import { normalize } from '../core/random.js';

export class CombatSystem {
  updateAutoFire(player, input, dt, projectilePool, layer, audio, enemies = []) {
    player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    if (player.fireCooldown > 0) return;

    let aimDirection = normalize(input.pointer.worldX - player.x, input.pointer.worldY - player.y);

    if (!input.pointer.active && enemies.length > 0) {
      const nearest = enemies.reduce((closest, enemy) => {
        const currentDistance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        return currentDistance < closest.distance ? { enemy, distance: currentDistance } : closest;
      }, { enemy: null, distance: Infinity }).enemy;

      if (nearest) {
        aimDirection = normalize(nearest.x - player.x, nearest.y - player.y);
      }
    }

    const spread = player.projectileCount === 1 ? 0 : 0.12;
    const startIndex = -(player.projectileCount - 1) / 2;

    for (let index = 0; index < player.projectileCount; index += 1) {
      const angle = Math.atan2(aimDirection.y, aimDirection.x) + (startIndex + index) * spread;
      const projectile = projectilePool.acquire({
        x: player.x + Math.cos(angle) * 28,
        y: player.y + Math.sin(angle) * 28,
        vx: Math.cos(angle) * player.bulletSpeed,
        vy: Math.sin(angle) * player.bulletSpeed,
        damage: player.damage,
        pierceLeft: player.pierce,
        explosionRadius: player.explosionRadius,
        life: 1.35
      });
      layer.addChild(projectile.display);
      projectile.display.position.set(projectile.x, projectile.y);
    }

    player.fireCooldown = 1 / player.fireRate;
    audio.playShoot();
  }

  createEnemyProjectile(x, y, direction, damage, projectilePool, layer) {
    const projectile = projectilePool.acquire({
      owner: 'enemy',
      x,
      y,
      vx: direction.x * 360,
      vy: direction.y * 360,
      damage,
      pierceLeft: 0,
      explosionRadius: 0,
      life: 2.6
    });
    projectile.display.clear().circle(0, 0, 7).fill(0xfacc15).stroke({ width: 2, color: 0xfef3c7, alpha: 0.9 });
    projectile.display.position.set(x, y);
    layer.addChild(projectile.display);
  }
}
