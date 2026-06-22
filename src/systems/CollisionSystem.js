import { distanceSquared, normalize } from '../core/random.js';

export class CollisionSystem {
  constructor(spatialGrid) {
    this.spatialGrid = spatialGrid;
  }

  rebuildEnemyGrid(enemies) {
    this.spatialGrid.clear();
    enemies.forEach((enemy) => this.spatialGrid.insert(enemy));
  }

  updateProjectiles({ player, enemies, projectiles, releaseProjectile, onEnemyHit, onPlayerHit }) {
    projectiles.forEach((projectile) => {
      if (projectile.owner === 'enemy') {
        const radius = projectile.radius + player.radius;
        if (distanceSquared(projectile, player) <= radius * radius && player.invulnerableTimer <= 0) {
          onPlayerHit(projectile.damage);
          releaseProjectile(projectile);
        }
        return;
      }

      const nearbyEnemies = this.spatialGrid.query(projectile.x, projectile.y, 96);
      for (const enemy of nearbyEnemies) {
        if (projectile.hits.has(enemy)) continue;
        const radius = projectile.radius + enemy.radius;
        if (distanceSquared(projectile, enemy) > radius * radius) continue;

        projectile.hits.add(enemy);
        onEnemyHit(enemy, projectile);

        if (projectile.pierceLeft > 0) {
          projectile.pierceLeft -= 1;
        } else {
          releaseProjectile(projectile);
          break;
        }
      }
    });

    this.resolveEnemyOverlap(enemies);
  }

  updatePlayerEnemyContact(player, enemies, onPlayerHit) {
    enemies.forEach((enemy) => {
      const radius = player.radius + enemy.radius;
      if (distanceSquared(player, enemy) > radius * radius) return;

      const direction = normalize(player.x - enemy.x, player.y - enemy.y);
      player.x += direction.x * 16;
      player.y += direction.y * 16;
      enemy.x -= direction.x * 10;
      enemy.y -= direction.y * 10;

      if (player.invulnerableTimer <= 0) {
        onPlayerHit(enemy.damage);
      }
    });
  }

  resolveEnemyOverlap(enemies) {
    enemies.forEach((enemy) => {
      const nearbyEnemies = this.spatialGrid.query(enemy.x, enemy.y, enemy.radius * 3);
      nearbyEnemies.forEach((other) => {
        if (enemy === other) return;
        const dx = enemy.x - other.x;
        const dy = enemy.y - other.y;
        const distance = Math.hypot(dx, dy) || 1;
        const targetDistance = enemy.radius + other.radius + 2;
        if (distance >= targetDistance) return;
        const push = (targetDistance - distance) * 0.5;
        enemy.x += (dx / distance) * push;
        enemy.y += (dy / distance) * push;
      });
    });
  }
}
