import { describe, it, expect } from 'vitest';
import { createSeededRng } from './rng';

describe('rng', () => {
  it('produces deterministic values', () => {
    const rng = createSeededRng(42);
    const a = rng();
    const rng2 = createSeededRng(42);
    expect(rng2()).toBe(a);
  });
});
