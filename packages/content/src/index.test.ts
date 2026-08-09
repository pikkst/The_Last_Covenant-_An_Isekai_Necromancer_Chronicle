import { describe, it, expect } from 'vitest';

describe('content', () => {
  it('exports content version', () => {
    expect(import('./index').then(m => m.CONTENT_VERSION)).resolves.toBe('0.1.0');
  });
});
