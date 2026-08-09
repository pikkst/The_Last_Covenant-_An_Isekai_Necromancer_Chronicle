import { describe, it, expect } from 'vitest';
import { FakeIdGenerator } from './id';

describe('id', () => {
  it('generates deterministic identifiers', () => {
    const gen = new FakeIdGenerator();
    expect(gen.generate()).toBe('test-0');
    expect(gen.generate()).toBe('test-1');
  });

  it('starts from custom counter', () => {
    const gen = new FakeIdGenerator(10);
    expect(gen.generate()).toBe('test-10');
  });
});
