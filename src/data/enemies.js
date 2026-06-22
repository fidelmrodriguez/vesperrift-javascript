export const ENEMY_TYPES = {
  melee: {
    label: 'Caçador',
    radius: 18,
    hp: 42,
    hpScale: 4,
    speed: 135,
    damage: 10,
    xpValue: 14,
    weight: 58
  },
  ranged: {
    label: 'Atirador',
    radius: 16,
    hp: 34,
    hpScale: 3,
    speed: 88,
    damage: 8,
    xpValue: 18,
    weight: 28
  },
  charger: {
    label: 'Investidor',
    radius: 20,
    hp: 58,
    hpScale: 6,
    speed: 105,
    damage: 16,
    xpValue: 24,
    weight: 14
  }
};

export function getWeightedEnemyType(wave) {
  const entries = Object.entries(ENEMY_TYPES).map(([type, config]) => {
    const chargerBonus = type === 'charger' ? wave * 1.8 : 0;
    const rangedBonus = type === 'ranged' ? wave * 1.2 : 0;
    return [type, config.weight + chargerBonus + rangedBonus];
  });
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;

  for (const [type, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return type;
  }

  return 'melee';
}
