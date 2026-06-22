import { Application, Container } from 'pixi.js';
import { EventBus } from '../core/EventBus.js';
import { ObjectPool } from '../core/ObjectPool.js';
import { SpatialGrid } from '../core/SpatialGrid.js';
import { InputManager } from '../core/InputManager.js';
import { AudioManager } from '../core/AudioManager.js';
import { Camera } from '../core/Camera.js';
import { WORLD } from '../core/constants.js';
import { randomBetween } from '../core/random.js';
import { createPlayer, resetPlayer } from '../entities/Player.js';
import { createEnemy, recycleEnemy } from '../entities/Enemy.js';
import { createProjectile, resetProjectile } from '../entities/Projectile.js';
import { createPickup } from '../entities/Pickup.js';
import { createParticle, resetParticle, createDamageText, resetDamageText } from '../entities/Particle.js';
import { MovementSystem } from '../systems/MovementSystem.js';
import { EnemyAISystem } from '../systems/EnemyAISystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { formatTime } from '../utils/formatTime.js';

export class ArenaScene {
  constructor({ canvasRoot, hud, upgradeOverlay, pauseOverlay, gameOverOverlay, events = new EventBus(), toast }) {
    this.canvasRoot = canvasRoot;
    this.hud = hud;
    this.upgradeOverlay = upgradeOverlay;
    this.pauseOverlay = pauseOverlay;
    this.gameOverOverlay = gameOverOverlay;
    this.events = events;
    this.toast = toast;
    this.app = null;
    this.worldLayer = new Container();
    this.enemyLayer = new Container();
    this.projectileLayer = new Container();
    this.pickupLayer = new Container();
    this.fxLayer = new Container();
    this.enemyLayer.zIndex = 10;
    this.projectileLayer.zIndex = 30;
    this.pickupLayer.zIndex = 5;
    this.fxLayer.zIndex = 40;
    this.player = createPlayer();
    this.input = new InputManager(canvasRoot);
    this.audio = new AudioManager();
    this.camera = new Camera({ width: 1, height: 1 });
    this.spatialGrid = new SpatialGrid(128);
    this.movement = new MovementSystem();
    this.enemyAI = new EnemyAISystem();
    this.combat = new CombatSystem();
    this.collision = new CollisionSystem(this.spatialGrid);
    this.upgrades = new UpgradeSystem(this.events);
    this.spawn = null;
    this.renderSystem = null;
    this.enemies = [];
    this.pickups = [];
    this.enemyProjectiles = [];
    this.elapsed = 0;
    this.wave = 1;
    this.paused = false;
    this.gameOver = false;
    this.started = false;
  }

  async init() {
    this.app = new Application();
    await this.app.init({
      resizeTo: this.canvasRoot,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio, 2)
    });

    this.canvasRoot.appendChild(this.app.canvas);
    this.app.stage.sortableChildren = true;
    this.worldLayer.sortableChildren = true;
    this.worldLayer.addChild(this.enemyLayer, this.projectileLayer, this.pickupLayer, this.player.display, this.fxLayer);
    this.app.stage.addChild(this.worldLayer);
    this.renderSystem = new RenderSystem(this.worldLayer);

    this.projectilePool = new ObjectPool(createProjectile, resetProjectile);
    this.enemyProjectilePool = new ObjectPool(createProjectile, resetProjectile);
    this.particlePool = new ObjectPool(createParticle, resetParticle);
    this.damageTextPool = new ObjectPool(createDamageText, resetDamageText);
    this.enemyPool = new ObjectPool(
      () => createEnemy('melee', 0, 0, 1),
      (enemy, payload) => recycleEnemy(enemy, payload.type, payload.x, payload.y, payload.wave)
    );
    this.spawn = new SpawnSystem(this.enemyPool, this.enemyLayer);

    this.input.bind();
    this.bindEvents();
    this.app.ticker.add((ticker) => this.update(Math.min(0.033, ticker.deltaMS / 1000)));
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  bindEvents() {
    this.events.on('upgrade:requested', ({ choices }) => {
      if (this.gameOver) return;
      this.setPaused(true, 'upgrade');
      this.upgradeOverlay.show(choices, (upgrade) => {
        this.upgrades.apply(this.player, upgrade);
        this.upgradeOverlay.hide();
        this.setPaused(false);
      });
    });

    this.events.on('upgrade:applied', (upgrade) => {
      this.audio.playUpgrade();
      this.toast.show('Upgrade aplicado', upgrade.title);
    });
  }

  start() {
    this.reset();
    this.started = true;
    this.gameOver = false;
    this.setPaused(false);
    this.toast.show('Run iniciada', 'Use WASD para mover, mouse para mirar e espaço para dash.');
  }

  prepareForStart() {
    this.started = false;
    this.gameOver = false;
    this.reset();
    this.updateHud();
  }

  reset() {
    resetPlayer(this.player);
    this.input.reset();
    this.elapsed = 0;
    this.wave = 1;
    this.gameOver = false;
    this.paused = false;
    this.enemies.forEach((enemy) => this.releaseEnemy(enemy));
    this.enemies = [];
    this.pickups.forEach((pickup) => pickup.display.removeFromParent());
    this.pickups = [];
    this.projectilePool.getActiveItems().forEach((projectile) => projectile.display.removeFromParent());
    this.enemyProjectilePool.getActiveItems().forEach((projectile) => projectile.display.removeFromParent());
    this.particlePool.getActiveItems().forEach((particle) => particle.display.removeFromParent());
    this.damageTextPool.getActiveItems().forEach((item) => item.display.removeFromParent());
    this.projectilePool.releaseAll();
    this.enemyProjectilePool.releaseAll();
    this.particlePool.releaseAll();
    this.damageTextPool.releaseAll();
    this.upgrades.reset();
    this.spawn?.reset();
    this.pauseOverlay.hidden = true;
    this.gameOverOverlay.root.hidden = true;
    this.upgradeOverlay.hide();
    this.player.display.position.set(this.player.x, this.player.y);
    this.worldLayer.addChild(this.player.display);
    this.updateHud();
  }

  update(dt) {
    if (!this.started || this.gameOver) return;

    if (this.input.consumePause()) {
      this.togglePause();
    }

    if (this.paused) return;

    this.elapsed += dt;
    this.wave = Math.max(1, Math.floor(this.elapsed / 35) + 1);

    this.input.updatePointerWorld(this.camera);
    this.movement.updatePlayer(this.player, this.input, dt, this.audio);
    this.combat.updateAutoFire(this.player, this.input, dt, this.projectilePool, this.projectileLayer, this.audio, this.enemies);
    this.spawn.update(dt, this.player, this.wave, this.enemies.length)?.forEach((enemy) => this.enemies.push(enemy));
    this.enemyAI.update(this.enemies, this.player, dt, (x, y, direction, damage) => {
      this.combat.createEnemyProjectile(x, y, direction, damage, this.enemyProjectilePool, this.projectileLayer);
    });

    const playerProjectiles = this.projectilePool.getActiveItems();
    const enemyProjectiles = this.enemyProjectilePool.getActiveItems();
    this.collision.rebuildEnemyGrid(this.enemies);
    this.collision.updateProjectiles({
      player: this.player,
      enemies: this.enemies,
      projectiles: playerProjectiles,
      releaseProjectile: (projectile) => this.releaseProjectile(projectile, this.projectilePool),
      onEnemyHit: (enemy, projectile) => this.hitEnemy(enemy, projectile),
      onPlayerHit: (damage) => this.hitPlayer(damage)
    });
    this.collision.updateProjectiles({
      player: this.player,
      enemies: this.enemies,
      projectiles: enemyProjectiles,
      releaseProjectile: (projectile) => this.releaseProjectile(projectile, this.enemyProjectilePool),
      onEnemyHit: () => {},
      onPlayerHit: (damage) => this.hitPlayer(damage)
    });
    this.collision.updatePlayerEnemyContact(this.player, this.enemies, (damage) => this.hitPlayer(damage));

    this.movement.updateProjectiles(playerProjectiles, dt, (projectile) => this.releaseProjectile(projectile, this.projectilePool));
    this.movement.updateProjectiles(enemyProjectiles, dt, (projectile) => this.releaseProjectile(projectile, this.enemyProjectilePool));
    this.movement.updatePickups(this.pickups, this.player, dt, (pickup) => this.collectPickup(pickup));
    this.movement.updateEffects(this.particlePool.getActiveItems(), dt, (particle) => this.releaseParticle(particle));
    this.movement.updateEffects(this.damageTextPool.getActiveItems(), dt, (item) => this.releaseDamageText(item));
    this.upgrades.update(dt, this.player, this.paused);
    this.camera.follow(this.player, dt);
    this.renderSystem.updateCamera(this.camera);
    this.updateHud();
  }

  hitEnemy(enemy, projectile) {
    enemy.hp -= projectile.damage;
    enemy.flashTimer = 0.08;
    this.spawnDamageText(enemy.x, enemy.y - 18, Math.round(projectile.damage));
    this.spawnParticles(enemy.x, enemy.y, 5, 0xfb7185);
    this.audio.playHit();

    if (enemy.hp <= 0) {
      this.killEnemy(enemy, projectile);
    }
  }

  killEnemy(enemy, projectile) {
    this.player.score += 1;
    this.spawnParticles(enemy.x, enemy.y, 18, 0x7dd3fc);
    this.createPickup(enemy.x, enemy.y, enemy.xpValue);

    if (projectile.explosionRadius > 0) {
      this.camera.shake(7, 0.16);
      this.spawnParticles(enemy.x, enemy.y, 26, 0xfacc15);
      this.enemies.forEach((other) => {
        if (other === enemy) return;
        const distance = Math.hypot(other.x - enemy.x, other.y - enemy.y);
        if (distance < projectile.explosionRadius) {
          other.hp -= projectile.damage * 0.45;
          this.spawnDamageText(other.x, other.y - 16, Math.round(projectile.damage * 0.45), 0xfacc15);
        }
      });
    }

    this.enemies = this.enemies.filter((item) => item !== enemy);
    this.releaseEnemy(enemy);
  }

  hitPlayer(damage) {
    if (this.player.invulnerableTimer > 0 || this.gameOver) return;
    this.player.hp = Math.max(0, this.player.hp - damage);
    this.player.invulnerableTimer = 0.48;
    this.camera.shake(10, 0.18);
    this.spawnDamageText(this.player.x, this.player.y - 28, Math.round(damage), 0xfb7185);
    this.spawnParticles(this.player.x, this.player.y, 10, 0xfb7185);

    if (this.player.hp <= 0) {
      this.endRun();
    }
  }

  createPickup(x, y, value) {
    const pickup = createPickup(x, y, value);
    this.pickupLayer.addChild(pickup.display);
    pickup.display.position.set(x, y);
    this.pickups.push(pickup);
  }

  collectPickup(pickup) {
    this.player.xp += pickup.value;
    this.pickups = this.pickups.filter((item) => item !== pickup);
    pickup.display.removeFromParent();
    this.spawnParticles(pickup.x, pickup.y, 6, 0x34d399);
  }

  spawnParticles(x, y, amount, color) {
    for (let index = 0; index < amount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomBetween(50, 260);
      const particle = this.particlePool.acquire({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: randomBetween(0.22, 0.62),
        radius: randomBetween(2, 5),
        color
      });
      this.fxLayer.addChild(particle.display);
      particle.display.position.set(x, y);
    }
  }

  spawnDamageText(x, y, value, color = 0xffffff) {
    const item = this.damageTextPool.acquire({ x, y, life: 0.65, text: String(value), color });
    this.fxLayer.addChild(item.display);
    item.display.position.set(x, y);
  }

  releaseProjectile(projectile, pool) {
    projectile.display.visible = false;
    projectile.display.removeFromParent();
    projectile.owner = 'player';
    projectile.display.clear().circle(0, 0, 6).fill(0xe0f2fe).stroke({ width: 2, color: 0x38bdf8, alpha: 0.9 });
    pool.release(projectile);
  }

  releaseEnemy(enemy) {
    enemy.display.visible = false;
    enemy.display.removeFromParent();
    this.enemyPool.release(enemy);
  }

  releaseParticle(particle) {
    particle.display.visible = false;
    particle.display.removeFromParent();
    this.particlePool.release(particle);
  }

  releaseDamageText(item) {
    item.display.visible = false;
    item.display.removeFromParent();
    this.damageTextPool.release(item);
  }

  setPaused(value, source = 'manual') {
    this.paused = value;
    if (source === 'manual') {
      this.pauseOverlay.hidden = !value;
    }
  }

  togglePause() {
    this.setPaused(!this.paused, 'manual');
  }

  endRun() {
    this.gameOver = true;
    this.started = false;
    this.gameOverOverlay.summary.textContent = `Tempo sobrevivido: ${formatTime(this.elapsed)} · Abates: ${this.player.score}`;
    this.gameOverOverlay.root.hidden = false;
    this.toast.show('Run encerrada', 'Reinicie a arena para tentar outra combinação de upgrades.');
  }

  updateHud() {
    this.hud.update({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      xp: this.player.xp,
      xpToLevel: this.player.xpToLevel,
      elapsed: this.elapsed,
      wave: this.wave,
      enemies: this.enemies.length,
      score: this.player.score
    });
  }

  resize() {
    if (!this.app) return;
    this.camera.resize(this.canvasRoot.clientWidth || 1, this.canvasRoot.clientHeight || 1);
  }
}
