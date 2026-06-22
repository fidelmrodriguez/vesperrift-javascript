export class SpatialGrid {
  constructor(cellSize = 120) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  clear() {
    this.cells.clear();
  }

  getCellKey(x, y) {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx}:${cy}`;
  }

  insert(entity) {
    const key = this.getCellKey(entity.x, entity.y);
    const bucket = this.cells.get(key) ?? [];
    bucket.push(entity);
    this.cells.set(key, bucket);
  }

  query(x, y, radius = this.cellSize) {
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);
    const result = [];

    for (let cy = minY; cy <= maxY; cy += 1) {
      for (let cx = minX; cx <= maxX; cx += 1) {
        const bucket = this.cells.get(`${cx}:${cy}`);
        if (bucket) result.push(...bucket);
      }
    }

    return result;
  }
}
