import { GAME_RULES } from '../core/constants.js';
import { getUpgradeChoices } from '../data/upgrades.js';

export class UpgradeSystem {
  constructor(events) {
    this.events = events;
    this.intervalTimer = 0;
  }

  reset() {
    this.intervalTimer = 0;
  }

  update(dt, player, isPaused) {
    if (isPaused) return;
    this.intervalTimer += dt;

    if (this.intervalTimer >= GAME_RULES.upgradeInterval) {
      this.intervalTimer = 0;
      this.requestUpgrade('checkpoint');
    }

    if (player.xp >= player.xpToLevel) {
      player.xp -= player.xpToLevel;
      player.level += 1;
      player.xpToLevel = Math.round(GAME_RULES.baseXpToLevel + player.level * 34);
      this.requestUpgrade('level');
    }
  }

  requestUpgrade(reason) {
    this.events.emit('upgrade:requested', {
      reason,
      choices: getUpgradeChoices(3)
    });
  }

  apply(player, upgrade) {
    upgrade.apply(player);
    this.events.emit('upgrade:applied', upgrade);
  }
}
