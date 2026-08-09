import { describe, it, expect } from 'vitest';
import { AppError, Result, httpStatusForCode, createTraceContext, ApiErrorResponse } from '@tlc/contracts';
import { createStructuredLogger, noopLogger, InMemoryMetrics, NoOpMetrics, NoOpTracer } from '@tlc/observability';

describe('workspace package boundary', () => {
  it('imports AppError from @tlc/contracts', () => {
    const err = new AppError('NOT_FOUND', 'missing');
    expect(err.code).toBe('NOT_FOUND');
  });

  it('imports Result type from @tlc/contracts', () => {
    const res: Result<string> = { ok: true, value: 'x' };
    expect(res.ok).toBe(true);
  });

  it('maps error codes to HTTP status', () => {
    expect(httpStatusForCode('NOT_FOUND')).toBe(404);
    expect(httpStatusForCode('VALIDATION_ERROR')).toBe(400);
    expect(httpStatusForCode('UNAUTHORIZED')).toBe(401);
    expect(httpStatusForCode('FORBIDDEN')).toBe(403);
    expect(httpStatusForCode('CONFLICT')).toBe(409);
  });

  it('creates trace context', () => {
    const ctx = createTraceContext('trace-1', 'span-1');
    expect(ctx.traceId).toBe('trace-1');
    expect(ctx.spanId).toBe('span-1');
  });

  it('imports logger from @tlc/observability', () => {
    const logger = createStructuredLogger();
    expect(() => logger.log('info', 'hello')).not.toThrow();
  });

  it('imports noopLogger from @tlc/observability', () => {
    expect(() => noopLogger.log('info', 'hello')).not.toThrow();
  });

  it('imports metrics from @tlc/observability', () => {
    const m = new InMemoryMetrics();
    m.counter('c', 'help').increment();
    expect(m.collect()).toHaveLength(1);
  });

  it('imports NoOpMetrics from @tlc/observability', () => {
    const m = new NoOpMetrics();
    expect(() => m.counter('c', 'help').increment()).not.toThrow();
  });

  it('imports tracer from @tlc/observability', () => {
    const t = new NoOpTracer();
    const s = t.startSpan('x');
    expect(() => s.end()).not.toThrow();
  });

  it('ApiErrorResponse shape is valid', () => {
    const res: ApiErrorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: 'missing',
        traceId: 'trace-1',
      },
    };
    expect(res.error.code).toBe('NOT_FOUND');
  });
});
