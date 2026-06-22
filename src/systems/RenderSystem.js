import { Graphics } from 'pixi.js';
import { WORLD } from '../core/constants.js';

export class RenderSystem {
  constructor(worldLayer) {
    this.worldLayer = worldLayer;
    this.grid = new Graphics();
    this.grid.zIndex = 0;
    this.worldLayer.addChild(this.grid);
    this.drawArenaGrid();
  }

  drawArenaGrid() {
    this.grid.clear();
    this.grid.rect(0, 0, WORLD.width, WORLD.height).fill({ color: 0x020617, alpha: 0.52 });
    this.grid.rect(0, 0, WORLD.width, WORLD.height).stroke({ width: 4, color: 0x38bdf8, alpha: 0.28 });

    for (let x = 0; x <= WORLD.width; x += 120) {
      this.grid.moveTo(x, 0).lineTo(x, WORLD.height).stroke({ width: 1, color: 0x7dd3fc, alpha: 0.08 });
    }

    for (let y = 0; y <= WORLD.height; y += 120) {
      this.grid.moveTo(0, y).lineTo(WORLD.width, y).stroke({ width: 1, color: 0x7dd3fc, alpha: 0.08 });
    }
  }

  updateCamera(camera) {
    this.worldLayer.position.set(-camera.x, -camera.y);
  }
}
