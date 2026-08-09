import { describe, it, expect } from 'vitest';
import { SystemClock } from './clock';

describe('clock', () => {
  it('SystemClock returns current time', () => {
    const clock = new SystemClock();
    const now = clock.now();
    expect(now).toBeInstanceOf(Date);
    expect(now.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
