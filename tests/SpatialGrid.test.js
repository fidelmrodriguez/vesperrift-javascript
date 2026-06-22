import { describe, expect, it } from 'vitest';
import { SpatialGrid } from '../src/core/SpatialGrid.js';

describe('SpatialGrid', () => {
  it('retorna entidades próximas dentro das células consultadas', () => {
    const grid = new SpatialGrid(100);
    const near = { id: 'near', x: 110, y: 120 };
    const far = { id: 'far', x: 620, y: 620 };

    grid.insert(near);
    grid.insert(far);

    const result = grid.query(100, 100, 80);

    expect(result).toContain(near);
    expect(result).not.toContain(far);
  });
});
