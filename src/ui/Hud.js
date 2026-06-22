import { formatTime } from '../utils/formatTime.js';
export class Hud {
  constructor(root) {
    this.root = root;
    this.refs = {
      hp: root.querySelector('[data-hud-hp]'),
      hpBar: root.querySelector('[data-hud-hp-bar]'),
      xp: root.querySelector('[data-hud-xp]'),
      xpBar: root.querySelector('[data-hud-xp-bar]'),
      time: root.querySelector('[data-hud-time]'),
      wave: root.querySelector('[data-hud-wave]'),
      enemies: root.querySelector('[data-hud-enemies]'),
      score: root.querySelector('[data-hud-score]')
    };
  }

  update(state) {
    const hpPercent = Math.max(0, (state.hp / state.maxHp) * 100);
    const xpPercent = Math.max(0, (state.xp / state.xpToLevel) * 100);
    this.refs.hp.textContent = `${Math.ceil(state.hp)} / ${state.maxHp}`;
    this.refs.hpBar.style.width = `${hpPercent}%`;
    this.refs.xp.textContent = `${Math.floor(state.xp)} / ${state.xpToLevel}`;
    this.refs.xpBar.style.width = `${xpPercent}%`;
    this.refs.time.textContent = formatTime(state.elapsed);
    this.refs.wave.textContent = String(state.wave);
    this.refs.enemies.textContent = String(state.enemies);
    this.refs.score.textContent = String(state.score);
  }
}
