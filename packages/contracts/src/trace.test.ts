import { describe, it, expect } from 'vitest';
import { createTraceContext, createTraceContextCarrier, extractTraceContext, validateTraceContext } from './trace';

describe('trace', () => {
  it('createTraceContext generates valid W3C lengths', () => {
    const ctx = createTraceContext();
    expect(ctx.traceId).toHaveLength(32);
    expect(ctx.spanId).toHaveLength(16);
    expect(ctx.sampled).toBe(true);
    expect(validateTraceContext(ctx)).toBe(true);
  });

  it('createTraceContext accepts provided ids and validates them', () => {
    const ctx = createTraceContext('abcdef0123456789abcdef0123456789', 'abcdef0123456789');
    expect(ctx.traceId).toBe('abcdef0123456789abcdef0123456789');
    expect(ctx.spanId).toBe('abcdef0123456789');
    expect(validateTraceContext(ctx)).toBe(true);
  });

  it('createTraceContext rejects invalid supplied trace ids', () => {
    const ctx = createTraceContext('short', 'abcdef0123456789');
    expect(validateTraceContext(ctx)).toBe(false);
  });

  it('createTraceContext rejects invalid supplied span ids', () => {
    const ctx = createTraceContext('abcdef0123456789abcdef0123456789', 'short');
    expect(validateTraceContext(ctx)).toBe(false);
  });

  it('createTraceContextCarrier honors sampled flag', () => {
    const sampled = createTraceContext('abcdef0123456789abcdef0123456789', 'abcdef0123456789');
    const unsampled = createTraceContext('abcdef0123456789abcdef0123456789', 'abcdef0123456789');
    unsampled.sampled = false;
    expect(createTraceContextCarrier(sampled)).toEqual({
      traceparent: '00-abcdef0123456789abcdef0123456789-abcdef0123456789-01',
    });
    expect(createTraceContextCarrier(unsampled)).toEqual({
      traceparent: '00-abcdef0123456789abcdef0123456789-abcdef0123456789-00',
    });
  });

  it('generated context round-trips through carrier', () => {
    const ctx = createTraceContext();
    const carrier = createTraceContextCarrier(ctx);
    const extracted = extractTraceContext(carrier);
    expect(extracted).toBeDefined();
    expect(extracted!.traceId).toBe(ctx.traceId);
    expect(extracted!.spanId).toBe(ctx.spanId);
    expect(extracted!.sampled).toBe(ctx.sampled);
  });

  it('extractTraceContext parses valid traceparent', () => {
    const carrier = { traceparent: '00-abcdef0123456789abcdef0123456789-abcdef0123456789-01' };
    const ctx = extractTraceContext(carrier);
    expect(ctx).toBeDefined();
    expect(ctx!.traceId).toBe('abcdef0123456789abcdef0123456789');
    expect(ctx!.spanId).toBe('abcdef0123456789');
    expect(ctx!.sampled).toBe(true);
  });

  it('extractTraceContext returns undefined for invalid traceparent', () => {
    expect(extractTraceContext({ traceparent: 'invalid' })).toBeUndefined();
  });

  it('extractTraceContext returns undefined when missing', () => {
    expect(extractTraceContext({})).toBeUndefined();
  });

  it('extractTraceContext handles unsampled', () => {
    const carrier = { traceparent: '00-abcdef0123456789abcdef0123456789-abcdef0123456789-00' };
    const ctx = extractTraceContext(carrier);
    expect(ctx).toBeDefined();
    expect(ctx!.sampled).toBe(false);
  });
});
