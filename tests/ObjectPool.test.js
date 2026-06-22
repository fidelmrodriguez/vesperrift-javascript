import { describe, expect, it } from 'vitest';
import { ObjectPool } from '../src/core/ObjectPool.js';

describe('ObjectPool', () => {
  it('reutiliza itens liberados', () => {
    let created = 0;
    const pool = new ObjectPool(() => ({ id: ++created }), (item, payload) => Object.assign(item, payload));

    const first = pool.acquire({ active: true });
    pool.release(first);
    const second = pool.acquire({ active: true });

    expect(second).toBe(first);
    expect(created).toBe(1);
    expect(pool.getActiveItems()).toHaveLength(1);
  });
});
