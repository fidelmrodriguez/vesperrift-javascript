import { GAME_RULES, WORLD } from '../core/constants.js';
import { randomBetween } from '../core/random.js';
import { getWeightedEnemyType } from '../data/enemies.js';

export class SpawnSystem {
  constructor(enemyPool, layer) {
    this.enemyPool = enemyPool;
    this.layer = layer;
    this.timer = 0;
  }

  reset() {
    this.timer = 0;
  }

  update(dt, player, wave, enemyCount) {
    this.timer -= dt;
    if (this.timer > 0 || enemyCount >= GAME_RULES.enemyLimit) return null;

    const delay = Math.max(GAME_RULES.spawnMinDelay, GAME_RULES.spawnBaseDelay - wave * 0.07);
    this.timer = delay;
    const spawnAmount = wave >= 7 ? 3 : wave >= 4 ? 2 : 1;
    const spawned = [];

    for (let index = 0; index < spawnAmount && enemyCount + spawned.length < GAME_RULES.enemyLimit; index += 1) {
      const position = this.getSpawnPosition(player);
      const type = getWeightedEnemyType(wave);
      const enemy = this.enemyPool.acquire({ type, x: position.x, y: position.y, wave });
      enemy.display.position.set(enemy.x, enemy.y);
      this.layer.addChild(enemy.display);
      spawned.push(enemy);
    }

    return spawned;
  }

  getSpawnPosition(player) {
    const side = Math.floor(Math.random() * 4);
    const margin = 160;
    const position = { x: player.x, y: player.y };

    if (side === 0) {
      position.x = randomBetween(0, WORLD.width);
      position.y = player.y - margin - randomBetween(0, 240);
    } else if (side === 1) {
      position.x = player.x + margin + randomBetween(0, 260);
      position.y = randomBetween(0, WORLD.height);
    } else if (side === 2) {
      position.x = randomBetween(0, WORLD.width);
      position.y = player.y + margin + randomBetween(0, 240);
    } else {
      position.x = player.x - margin - randomBetween(0, 260);
      position.y = randomBetween(0, WORLD.height);
    }

    position.x = Math.max(40, Math.min(WORLD.width - 40, position.x));
    position.y = Math.max(40, Math.min(WORLD.height - 40, position.y));
    return position;
  }
}
