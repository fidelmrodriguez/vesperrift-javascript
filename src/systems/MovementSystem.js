import { clamp, normalize } from '../core/random.js';
import { WORLD } from '../core/constants.js';

export class MovementSystem {
  updatePlayer(player, input, dt, audio) {
    const axis = input.getAxis();

    if (input.consumeDash() && player.dashCooldownTimer <= 0 && axis.moving) {
      player.dashTimer = player.dashDuration;
      player.dashCooldownTimer = player.dashCooldown;
      player.invulnerableTimer = 0.28;
      audio.playDash();
    }

    const isDashing = player.dashTimer > 0;
    const speed = isDashing ? player.dashSpeed : player.speed;
    player.vx = axis.x * speed;
    player.vy = axis.y * speed;
    player.x = clamp(player.x + player.vx * dt, WORLD.safePadding, WORLD.width - WORLD.safePadding);
    player.y = clamp(player.y + player.vy * dt, WORLD.safePadding, WORLD.height - WORLD.safePadding);
    player.dashTimer = Math.max(0, player.dashTimer - dt);
    player.dashCooldownTimer = Math.max(0, player.dashCooldownTimer - dt);
    player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);

    const aimDirection = normalize(input.pointer.worldX - player.x, input.pointer.worldY - player.y);
    player.aimAngle = Math.atan2(aimDirection.y, aimDirection.x);
    player.display.position.set(player.x, player.y);
    player.aim.rotation = player.aimAngle;
    if (input.pointer.active) player.visualAimAngle = player.aimAngle;
    player.body.alpha = player.invulnerableTimer > 0 ? 0.52 : 1;
  }

  updateProjectiles(projectiles, dt, releaseProjectile) {
    projectiles.forEach((projectile) => {
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;
      projectile.display.position.set(projectile.x, projectile.y);

      const outsideWorld = projectile.x < -100 || projectile.x > WORLD.width + 100 || projectile.y < -100 || projectile.y > WORLD.height + 100;
      if (projectile.life <= 0 || outsideWorld) {
        projectile.display.visible = false;
        releaseProjectile(projectile);
      }
    });
  }

  updatePickups(pickups, player, dt, onCollect) {
    pickups.forEach((pickup) => {
      const dx = player.x - pickup.x;
      const dy = player.y - pickup.y;
      const distance = Math.hypot(dx, dy);
      const magnetRange = 140;

      if (distance < magnetRange) {
        const force = 1 - distance / magnetRange;
        pickup.x += (dx / (distance || 1)) * force * 420 * dt;
        pickup.y += (dy / (distance || 1)) * force * 420 * dt;
      }

      pickup.display.position.set(pickup.x, pickup.y);

      if (distance < pickup.radius + player.radius) {
        onCollect(pickup);
      }
    });
  }

  updateEffects(items, dt, releaseItem) {
    items.forEach((item) => {
      item.x += (item.vx ?? 0) * dt;
      item.y += (item.vy ?? 0) * dt;
      item.life -= dt;
      item.display.position.set(item.x, item.y);
      item.display.alpha = Math.max(0, item.life / item.maxLife);

      if (item.life <= 0) {
        item.display.visible = false;
        releaseItem(item);
      }
    });
  }
}
