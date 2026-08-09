import { describe, it, expect } from 'vitest';
import { SystemIdGenerator } from './id';
import { Identifier } from '@tlc/contracts';

describe('id', () => {
  it('SystemIdGenerator produces unique identifiers', () => {
    const generator = new SystemIdGenerator();
    const a = generator.generate();
    const b = generator.generate();
    expect(a).not.toBe(b);
    expect(Identifier.validate(a)).toBe(true);
    expect(Identifier.validate(b)).toBe(true);
  });
});
