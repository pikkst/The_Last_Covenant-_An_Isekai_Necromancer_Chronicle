import { describe, it, expect, beforeEach } from 'vitest';
import { getTracer, resetOpenTelemetry, getMemoryExporter } from './otel';

describe('otel', () => {
  beforeEach(() => {
    resetOpenTelemetry();
  });

  it('returns a tracer even when @opentelemetry/api is missing', async () => {
    const tracer = getTracer();
    expect(tracer).toBeDefined();
    const span = tracer.startSpan('test');
    expect(span).toBeDefined();
    span.end();
  });

  it('bootstraps SDK provider and configured exporter receives a span', async () => {
    process.env.OTEL_EXPORTER_TYPE = 'memory';
    const tracer = getTracer();
    const span = tracer.startSpan('test-span', { 'test.key': 'value' });
    span.setAttribute('attr', 1);
    span.end();

    const exporter = getMemoryExporter();
    expect(exporter).toBeDefined();
    expect(exporter!.finishedSpans.length).toBeGreaterThan(0);
  });
});