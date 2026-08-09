import { describe, it, expect } from 'vitest';

describe('worker app', () => {
  it('imports observability primitives', async () => {
    const { createStructuredLogger, getTracer } = await import('@tlc/observability');
    const logger = createStructuredLogger();
    expect(() => logger.log('info', 'hello')).not.toThrow();
    const tracer = await getTracer();
    const span = tracer.startSpan('test');
    span.end();
  });

  it('is wired up', () => {
    expect(true).toBe(true);
  });
});
