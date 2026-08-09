import { describe, it, expect } from 'vitest';
import { getTracer } from './otel';

describe('otel', () => {
  it('returns a tracer even when @opentelemetry/api is missing', async () => {
    const tracer = await getTracer();
    expect(tracer).toBeDefined();
    const span = tracer.startSpan('test');
    expect(span).toBeDefined();
    span.end();
  });
});
