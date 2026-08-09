import { describe, it, expect } from 'vitest';
import { createTestBuilder } from './builders';

interface TestEntity {
  name: string;
  count: number;
  active: boolean;
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
});
