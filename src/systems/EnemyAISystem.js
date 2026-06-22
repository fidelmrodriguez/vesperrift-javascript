import { normalize, randomBetween } from '../core/random.js';

export class EnemyAISystem {
  update(enemies, player, dt, createEnemyProjectile) {
    enemies.forEach((enemy) => {
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
      enemy.chargeCooldown = Math.max(0, enemy.chargeCooldown - dt);
      enemy.flashTimer = Math.max(0, enemy.flashTimer - dt);

      if (enemy.type === 'ranged') {
        this.updateRanged(enemy, player, dt, createEnemyProjectile);
      } else if (enemy.type === 'charger') {
        this.updateCharger(enemy, player, dt);
      } else {
        this.updateMelee(enemy, player, dt);
      }

      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
      enemy.display.position.set(enemy.x, enemy.y);
      enemy.body.tint = enemy.flashTimer > 0 ? 0xffffff : 0xffffff;
      enemy.body.alpha = enemy.flashTimer > 0 ? 0.62 : 1;
    });
  }

  updateMelee(enemy, player) {
    const direction = normalize(player.x - enemy.x, player.y - enemy.y);
    enemy.vx = direction.x * enemy.speed;
    enemy.vy = direction.y * enemy.speed;
    enemy.display.rotation = Math.atan2(direction.y, direction.x);
  }

  updateRanged(enemy, player, dt, createEnemyProjectile) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.hypot(dx, dy);
    const direction = normalize(dx, dy);
    const preferredDistance = 420;
    const strafe = Math.sin(performance.now() * 0.002 + enemy.x) * 0.45;

    if (distance < preferredDistance * 0.75) {
      enemy.vx = -direction.x * enemy.speed + -direction.y * enemy.speed * strafe;
      enemy.vy = -direction.y * enemy.speed + direction.x * enemy.speed * strafe;
    } else if (distance > preferredDistance * 1.18) {
      enemy.vx = direction.x * enemy.speed;
      enemy.vy = direction.y * enemy.speed;
    } else {
      enemy.vx = -direction.y * enemy.speed * strafe;
      enemy.vy = direction.x * enemy.speed * strafe;
    }

    enemy.display.rotation = Math.atan2(direction.y, direction.x);

    if (enemy.attackCooldown <= 0 && distance < 620) {
      createEnemyProjectile(enemy.x, enemy.y, direction, enemy.damage);
      enemy.attackCooldown = randomBetween(1.1, 1.7);
    }
  }

  updateCharger(enemy, player, dt) {
    const direction = normalize(player.x - enemy.x, player.y - enemy.y);
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    if (enemy.chargeTimer > 0) {
      enemy.chargeTimer -= dt;
      enemy.vx = enemy.chargeDirection.x * enemy.speed * 3.35;
      enemy.vy = enemy.chargeDirection.y * enemy.speed * 3.35;
      enemy.display.rotation = Math.atan2(enemy.chargeDirection.y, enemy.chargeDirection.x);
      return;
    }

    if (enemy.chargeCooldown <= 0 && distance < 520) {
      enemy.chargeDirection = direction;
      enemy.chargeTimer = 0.46;
      enemy.chargeCooldown = 2.3;
      enemy.state = 'charge';
      return;
    }

    enemy.state = 'chase';
    enemy.vx = direction.x * enemy.speed * 0.88;
    enemy.vy = direction.y * enemy.speed * 0.88;
    enemy.display.rotation = Math.atan2(direction.y, direction.x);
  }
}
