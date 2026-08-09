import { describe, it, expect } from 'vitest';
import { SystemClock, FakeClock } from './clock';

describe('clock', () => {
  it('SystemClock returns current time', () => {
    const clock = new SystemClock();
    expect(clock.now()).toBeInstanceOf(Date);
  });

  it('FakeClock returns fixed time', () => {
    const fixed = new Date('2024-01-01T00:00:00Z');
    const clock = new FakeClock(fixed);
    expect(clock.now()).toBe(fixed);
  });
});
