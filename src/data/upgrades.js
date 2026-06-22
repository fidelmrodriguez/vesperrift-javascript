import { shuffle } from '../core/random.js';

export const UPGRADES = [
  {
    id: 'fire-rate',
    title: 'Cadência elevada',
    description: '+20% de velocidade nos disparos automáticos.',
    apply(player) {
      player.fireRate *= 1.2;
    }
  },
  {
    id: 'damage',
    title: 'Munição pesada',
    description: '+25% de dano base nos projéteis.',
    apply(player) {
      player.damage *= 1.25;
    }
  },
  {
    id: 'extra-projectile',
    title: 'Disparo duplo',
    description: '+1 projétil por rajada, com abertura lateral.',
    apply(player) {
      player.projectileCount += 1;
    }
  },
  {
    id: 'piercing-shot',
    title: 'Tiro perfurante',
    description: 'Projéteis atravessam mais um inimigo antes de sumir.',
    apply(player) {
      player.pierce += 1;
    }
  },
  {
    id: 'dash-cooldown',
    title: 'Impulso rápido',
    description: '-18% de tempo de recarga no dash.',
    apply(player) {
      player.dashCooldown *= 0.82;
    }
  },
  {
    id: 'speed',
    title: 'Passos leves',
    description: '+14% de velocidade de movimento.',
    apply(player) {
      player.speed *= 1.14;
    }
  },
  {
    id: 'max-health',
    title: 'Armadura viva',
    description: '+20 de vida máxima e cura parcial imediata.',
    apply(player) {
      player.maxHp += 20;
      player.hp = Math.min(player.maxHp, player.hp + 24);
    }
  },
  {
    id: 'explosive-shot',
    title: 'Impacto explosivo',
    description: 'Projéteis causam dano em área no abate.',
    apply(player) {
      player.explosionRadius = Math.max(player.explosionRadius, 78);
    }
  }
];

export function getUpgradeChoices(amount = 3) {
  return shuffle(UPGRADES).slice(0, amount);
}
