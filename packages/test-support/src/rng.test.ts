import { describe, it, expect } from 'vitest';
import { createSeededRng } from './rng';

describe('rng', () => {
  it('produces deterministic values', () => {
    const rng = createSeededRng(42);
    const a = rng.next();
    const rng2 = createSeededRng(42);
    expect(rng2.next()).toBe(a);
  });

  it('returns values in [0, 1)', () => {
    const rng = createSeededRng(1);
    for (let i = 0; i < 100; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
