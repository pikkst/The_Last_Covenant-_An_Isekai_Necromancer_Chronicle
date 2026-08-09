import { describe, it, expect } from 'vitest';
import { FakeClock } from './clock';

describe('clock', () => {
  it('returns fixed time', () => {
    const fixed = new Date('2024-01-01T00:00:00Z');
    const clock = new FakeClock(fixed);
    expect(clock.now()).toEqual(fixed);
  });

  it('advances time', () => {
    const fixed = new Date('2024-01-01T00:00:00Z');
    const clock = new FakeClock(fixed);
    clock.advance(1000);
    expect(clock.now()).toEqual(new Date('2024-01-01T00:00:01Z'));
  });

  it('prevents external mutation of returned date', () => {
    const fixed = new Date('2024-01-01T00:00:00Z');
    const clock = new FakeClock(fixed);
    const now = clock.now();
    now.setUTCFullYear(2030);
    expect(clock.now()).toEqual(new Date('2024-01-01T00:00:00Z'));
  });

  it('prevents external mutation of constructor argument', () => {
    const fixed = new Date('2024-01-01T00:00:00Z');
    const clock = new FakeClock(fixed);
    fixed.setUTCFullYear(2030);
    expect(clock.now()).toEqual(new Date('2024-01-01T00:00:00Z'));
  });
});
