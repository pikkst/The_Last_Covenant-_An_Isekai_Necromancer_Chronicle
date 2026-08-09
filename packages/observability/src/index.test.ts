import { describe, it, expect } from 'vitest';
import { noopLogger } from './logger';
import { NoOpMetrics, InMemoryMetrics } from './metrics';
import { NoOpTracer } from './tracer';

describe('observability', () => {
  it('noopLogger does not throw', () => {
    expect(() => noopLogger.log('info', 'hello')).not.toThrow();
  });

  it('NoOpMetrics does not throw', () => {
    const m = new NoOpMetrics();
    const c = m.counter('x', 'help');
    expect(() => c.increment()).not.toThrow();
  });

  it('NoOpTracer does not throw', () => {
    const t = new NoOpTracer();
    const s = t.startSpan('x');
    expect(() => s.end()).not.toThrow();
  });

  it('InMemoryMetrics collects samples', () => {
    const m = new InMemoryMetrics();
    m.counter('c', 'help').increment(1);
    expect(m.collect()).toHaveLength(1);
  });
});
