// Layered hull artwork. All geometry is built once (or when a pooled enemy changes type).
// Local +X is the nose. Decorative exhaust never changes collision radii.
export function drawShip(body, engine, type, radius) {
  body.clear();
  engine.clear();
  const palettes = {
    player: [0x69e5ff, 0x91adc5, 0xe1f4ff],
    melee: [0xff557f, 0x855169, 0xeab4c3],
    ranged: [0xffc46a, 0x8e7754, 0xf3d9a1],
    charger: [0xc58aff, 0x735996, 0xd7c6fa]
  };
  const [light, metal, highlight] = palettes[type];
  const r = radius;
  const poly = (points, color, alpha = 1) => body.poly(points.map(v => v * r)).fill({ color, alpha });
  // Soft light beneath hull and hot twin exhausts.
  for (let i = 3; i > 0; i--) {
    engine.ellipse(-r * 0.6, 0, r * (0.75 + i * 0.18), r * (0.42 + i * 0.13)).fill({ color: light, alpha: 0.025 });
  }
  for (const side of [-1, 1]) {
    const y = side * r * 0.48;
    engine.poly([-r * 0.55, y - 4, -r * 2.1, y, -r * 0.55, y + 4]).fill({ color: light, alpha: 0.18 });
    engine.poly([-r * 0.55, y - 2, -r * 1.48, y, -r * 0.55, y + 2]).fill({ color: light, alpha: 0.65 });
    engine.ellipse(-r * 0.72, y, r * 0.23, 1.6).fill(0xf1fcff);
  }
  // Underside, bevels, separate wings and inset armor panels.
  const wing = type === 'ranged' ? 0.93 : type === 'charger' ? 0.72 : 0.86;
  for (const side of [-1, 1]) {
    poly([0.48, side * 0.12, -0.15, side * wing, -0.9, side * wing, -0.57, side * 0.28], 0x0a1325);
    poly([0.42, side * 0.17, -0.18, side * (wing - 0.08), -0.8, side * (wing - 0.08), -0.48, side * 0.26], metal);
    poly([0.42, side * 0.17, -0.18, side * (wing - 0.08), -0.34, side * 0.47], highlight, 0.72);
    poly([-0.26, side * 0.47, -0.73, side * 0.65, -0.57, side * 0.32], 0x17243a);
    body.moveTo(-r * 0.65, side * r * 0.73).lineTo(-r * 0.15, side * r * 0.68).stroke({ width: 1.3, color: light });
    body.roundRect(-r * 0.84, side * r * 0.48 - 3, r * 0.45, 6, 2).fill(0x202b40).stroke({ width: 1, color: metal });
    for (let j = 0; j < 3; j++) body.rect(-r * 0.65 + j * 3, side * r * 0.48 - 1.5, 1, 3).fill(light);
  }
  if (type === 'melee') {
    for (const s of [-1, 1]) {
      poly([-0.1, s * 0.65, 0.87, s * 0.59, 0.5, s * 0.28, 0.2, s * 0.43], metal);
      body.moveTo(r * 0.86, s * r * 0.59).lineTo(r * 0.47, s * r * 0.31).stroke({ width: 1.5, color: light });
    }
  }
  if (type === 'ranged') {
    for (const s of [-1, 1]) {
      body.roundRect(-r * 0.1, s * r * 0.68 - 3, r * 0.98, 6, 2).fill(0x182033).stroke({ width: 1, color: metal });
      body.rect(r * 0.68, s * r * 0.68 - 2, 4, 4).fill(light);
    }
  }
  const nose = type === 'charger' ? 1.18 : 1.05;
  poly([nose, 0, 0.13, -0.36, -0.75, -0.25, -0.85, 0, -0.75, 0.25, 0.13, 0.36], 0x101b2e);
  poly([nose, 0, 0.13, -0.29, -0.65, -0.2, -0.7, 0], highlight);
  poly([nose, 0, 0.13, 0.29, -0.65, 0.2, -0.7, 0], metal);
  poly([0.49, 0, 0.04, -0.19, -0.36, -0.14, -0.45, 0, -0.36, 0.14, 0.04, 0.19], 0x081324);
  poly([0.35, -0.015, 0.02, -0.13, -0.29, -0.095, -0.34, -0.015], light);
  poly([0.35, 0.015, 0.02, 0.13, -0.29, 0.095, -0.34, 0.015], light, 0.45);
  body.moveTo(r * 0.54, 0).lineTo(r * 0.87, 0).stroke({ width: 1, color: 0xffffff, alpha: 0.85 });
  body.circle(-r * 0.51, 0, 1.8).fill(light);
}
