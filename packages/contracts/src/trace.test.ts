import { describe, it, expect } from 'vitest';
import { createTraceContext, createTraceContextCarrier, extractTraceContext } from './trace';

describe('trace', () => {
  it('createTraceContext generates ids', () => {
    const ctx = createTraceContext();
    expect(ctx.traceId).toBeTruthy();
    expect(ctx.spanId).toBeTruthy();
    expect(ctx.sampled).toBe(true);
  });

  it('createTraceContext accepts provided ids', () => {
    const ctx = createTraceContext('trace-123', 'span-456');
    expect(ctx.traceId).toBe('trace-123');
    expect(ctx.spanId).toBe('span-456');
  });

  it('createTraceContextCarrier produces valid traceparent', () => {
    const ctx = createTraceContext('abc123', 'span123');
    const carrier = createTraceContextCarrier(ctx);
    expect(carrier.traceparent).toBe('00-abc123-span123-01');
  });

  it('extractTraceContext parses valid traceparent', () => {
    const carrier = { traceparent: '00-abc12345678901234567890123456789-def4567890123456-01' };
    const ctx = extractTraceContext(carrier);
    expect(ctx).toBeDefined();
    expect(ctx!.traceId).toBe('abc12345678901234567890123456789');
    expect(ctx!.spanId).toBe('def4567890123456');
    expect(ctx!.sampled).toBe(true);
  });

  it('extractTraceContext returns undefined for invalid traceparent', () => {
    expect(extractTraceContext({ traceparent: 'invalid' })).toBeUndefined();
  });

  it('extractTraceContext returns undefined when missing', () => {
    expect(extractTraceContext({})).toBeUndefined();
  });

  it('extractTraceContext handles unsampled', () => {
    const carrier = { traceparent: '00-abc12345678901234567890123456789-def4567890123456-00' };
    const ctx = extractTraceContext(carrier);
    expect(ctx).toBeDefined();
    expect(ctx!.sampled).toBe(false);
  });
});
