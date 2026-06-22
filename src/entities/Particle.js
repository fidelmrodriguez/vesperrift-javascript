import { Graphics, Text } from 'pixi.js';

export function createParticle() {
  const display = new Graphics().circle(0, 0, 3).fill(0x7dd3fc);
  display.zIndex = 40;

  return {
    kind: 'particle',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 0,
    color: 0x7dd3fc,
    radius: 3,
    display
  };
}

export function resetParticle(particle, payload) {
  Object.assign(particle, payload);
  particle.maxLife = payload.life;
  particle.display.clear().circle(0, 0, payload.radius ?? 3).fill(payload.color ?? 0x7dd3fc);
  particle.display.visible = true;
  particle.display.alpha = 1;
}

export function createDamageText() {
  const display = new Text({
    text: '',
    style: {
      fill: 0xffffff,
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: 18,
      fontWeight: '800',
      stroke: { color: 0x020617, width: 4 }
    }
  });
  display.anchor.set(0.5);
  display.zIndex = 50;

  return {
    kind: 'damageText',
    x: 0,
    y: 0,
    vy: -36,
    life: 0,
    maxLife: 0,
    display
  };
}

export function resetDamageText(item, payload) {
  Object.assign(item, payload);
  item.maxLife = payload.life;
  item.display.text = payload.text;
  item.display.style.fill = payload.color ?? 0xffffff;
  item.display.visible = true;
  item.display.alpha = 1;
}
