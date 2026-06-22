import { describe, expect, it } from 'vitest';
import { getUpgradeChoices, UPGRADES } from '../src/data/upgrades.js';

describe('upgrades', () => {
  it('retorna três opções de upgrade por padrão', () => {
    const choices = getUpgradeChoices();

    expect(choices).toHaveLength(3);
    expect(new Set(choices.map((item) => item.id)).size).toBe(3);
  });

  it('aplica melhoria de dano no jogador', () => {
    const player = { damage: 10 };
    const upgrade = UPGRADES.find((item) => item.id === 'damage');

    upgrade.apply(player);

    expect(player.damage).toBe(12.5);
  });
});
