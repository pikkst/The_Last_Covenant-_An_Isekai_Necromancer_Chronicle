import { describe, it, expect } from 'vitest';
import { createReplayFixture } from './replay';

describe('replay', () => {
  it('records and replays values', () => {
    const fixture = createReplayFixture();
    fixture.record('dice', 1);
    fixture.record('dice', 6);
    fixture.record('dice', 3);
    expect(fixture.replay('dice')).toBe(1);
    expect(fixture.replay('dice')).toBe(6);
    expect(fixture.replay('dice')).toBe(3);
  });

  it('resets sequence on replay start', () => {
    const fixture = createReplayFixture();
    fixture.record('dice', 1);
    fixture.record('dice', 6);
    expect(fixture.replay('dice')).toBe(1);
    fixture.reset();
    expect(fixture.replay('dice')).toBe(1);
  });

  it('throws when replay exhausted', () => {
    const fixture = createReplayFixture();
    fixture.record('dice', 1);
    fixture.replay('dice');
    expect(() => fixture.replay('dice')).toThrow();
  });

  it('throws for missing sequence', () => {
    const fixture = createReplayFixture();
    expect(() => fixture.replay('missing')).toThrow();
  });
});
