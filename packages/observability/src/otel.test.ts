import { describe, it, expect, beforeAll } from 'vitest';
import { getTracer, resetOpenTelemetry, getMemoryExporter } from './otel';

describe('otel', () => {
  beforeAll(() => {
    process.env.OTEL_EXPORTER_TYPE = 'memory';
  });

  it('returns a tracer even when @opentelemetry/api is missing', async () => {
    resetOpenTelemetry();
    const tracer = getTracer();
    expect(tracer).toBeDefined();
    const span = tracer.startSpan('test');
    expect(span).toBeDefined();
    span.end();
  });

  it('bootstraps SDK provider and configured exporter receives a span', async () => {
    resetOpenTelemetry();
    const tracer = getTracer();
    const span = tracer.startSpan('test-span', { 'test.key': 'value' });
    span.setAttribute('attr', 1);
    span.end();

    const exporter = getMemoryExporter();
    expect(exporter).toBeDefined();
    expect(exporter!.finishedSpans.length).toBeGreaterThan(0);
    const finishedSpan = exporter!.finishedSpans[exporter!.finishedSpans.length - 1] as { attributes?: Record<string, unknown> };
    expect(finishedSpan.attributes?.['test.key']).toBe('value');
    expect(finishedSpan.attributes?.attr).toBe(1);
  });
});
