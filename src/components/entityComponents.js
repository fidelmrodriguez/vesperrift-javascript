export function createTransform(x = 0, y = 0) {
  return { x, y };
}

export function createKinematics(vx = 0, vy = 0) {
  return { vx, vy };
}

export function createCollider(radius) {
  return { radius };
}

export function createHealth(maxHp) {
  return { hp: maxHp, maxHp };
}
