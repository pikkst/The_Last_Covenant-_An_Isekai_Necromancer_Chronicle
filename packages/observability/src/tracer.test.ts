import { describe, it, expect } from 'vitest';
import { NoOpTracer } from './tracer';

describe('tracer', () => {
  it('NoOpTracer.startSpan returns a span', () => {
    const tracer = new NoOpTracer();
    const span = tracer.startSpan('test');
    expect(span).toBeDefined();
    span.setAttribute('key', 'value');
    span.setError(new Error('oops'));
    span.end();
  });

  it('NoOpTracer.withSpan invokes fn', async () => {
    const tracer = new NoOpTracer();
    const result = await tracer.withSpan(
      'test',
      { attr: 1 },
      { traceId: 't', spanId: 's' },
      async (span) => {
        span.setAttribute('x', 1);
        return 42;
      },
    );
    expect(result).toBe(42);
  });

  it('withSpan ends span even on error', async () => {
    const tracer = new NoOpTracer();
    await expect(
      tracer.withSpan('test', {}, { traceId: 't', spanId: 's' }, async () => {
        throw new Error('fail');
      }),
    ).rejects.toThrow('fail');
  });
});
