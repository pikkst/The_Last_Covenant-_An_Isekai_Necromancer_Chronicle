import { describe, it, expect } from 'vitest';
import { createTestBuilder } from './builders';

interface TestEntity {
  name: string;
  count: number;
  active: boolean;
  nested?: { hp: number };
}

describe('builders', () => {
  it('builds initial state', () => {
    const builder = createTestBuilder<TestEntity>({ name: 'a', count: 0, active: false });
    expect(builder.build()).toEqual({ name: 'a', count: 0, active: false });
  });

  it('modifies single field', () => {
    const builder = createTestBuilder<TestEntity>({ name: 'a', count: 0, active: false });
    const modified = builder.with('count', 5);
    expect(modified.build()).toEqual({ name: 'a', count: 5, active: false });
    expect(builder.build()).toEqual({ name: 'a', count: 0, active: false });
  });

  it('resets to initial state', () => {
    const builder = createTestBuilder<TestEntity>({ name: 'a', count: 0, active: false });
    builder.with('count', 5);
    builder.reset();
    expect(builder.build()).toEqual({ name: 'a', count: 0, active: false });
  });

  it('isolates nested object overrides from external mutation', () => {
    const nested = { hp: 10 };
    const builder = createTestBuilder<TestEntity>({ name: 'a', count: 0, active: false });
    const modified = builder.with('name', 'b').with('nested', nested);
    nested.hp = 1;
    expect(modified.build()).toEqual({ name: 'b', count: 0, active: false, nested: { hp: 10 } });
  });
});
