import { describe, it, expect } from 'vitest';
import { redact, createStructuredLogger, noopLogger, createJsonConsoleSink } from './logger';

describe('logger', () => {
  it('noopLogger does not throw', () => {
    expect(() => noopLogger.log('info', 'hello')).not.toThrow();
  });

  it('noopLogger.child returns noopLogger', () => {
    expect(noopLogger.child({})).toBe(noopLogger);
  });

  it('createStructuredLogger includes timestamp, level, message', () => {
    const entries: unknown[] = [];
    const logger = createStructuredLogger({
      sink: (entry) => entries.push(entry),
    });
    logger.log('info', 'hello');
    expect(entries).toHaveLength(1);
    const entry = entries[0] as { timestamp: string; level: string; message: string };
    expect(entry.timestamp).toBeTruthy();
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('hello');
  });

  it('createStructuredLogger includes trace context', () => {
    const entries: unknown[] = [];
    const logger = createStructuredLogger({
      traceContext: { traceId: 'trace-1', spanId: 'span-1' },
      sink: (entry) => entries.push(entry),
    });
    logger.log('info', 'hello');
    const entry = entries[0] as { traceId: string; spanId: string };
    expect(entry.traceId).toBe('trace-1');
    expect(entry.spanId).toBe('span-1');
  });

  it('createStructuredLogger redacts secret keys', () => {
    const entries: unknown[] = [];
    const logger = createStructuredLogger({
      sink: (entry) => entries.push(entry),
    });
    logger.log('info', 'event', { password: 'secret123', data: 'public' });
    const entry = entries[0] as { meta: Record<string, unknown> };
    expect(entry.meta.password).toBe('[REDACTED]');
    expect(entry.meta.data).toBe('public');
  });

  it('createStructuredLogger redacts Bearer tokens', () => {
    const entries: unknown[] = [];
    const logger = createStructuredLogger({
      sink: (entry) => entries.push(entry),
    });
    logger.log('info', 'event', { token: 'Bearer abc.def.ghi' });
    const entry = entries[0] as { meta: Record<string, unknown> };
    expect(entry.meta.token).toBe('[REDACTED]');
  });

  it('createStructuredLogger redacts long tokens', () => {
    const entries: unknown[] = [];
    const logger = createStructuredLogger({
      sink: (entry) => entries.push(entry),
    });
    logger.log('info', 'event', { key: 'abcdefghijklmnopqrstuvwxyz0123456789+/=' });
    const entry = entries[0] as { meta: Record<string, unknown> };
    expect(entry.meta.key).toBe('[REDACTED]');
  });

  it('createStructuredLogger handles nested objects', () => {
    const entries: unknown[] = [];
    const logger = createStructuredLogger({
      sink: (entry) => entries.push(entry),
    });
    logger.log('info', 'event', { outer: { password: 'secret' } });
    const entry = entries[0] as { meta: { outer: Record<string, unknown> } };
    expect(entry.meta.outer.password).toBe('[REDACTED]');
  });

  it('createStructuredLogger handles arrays', () => {
    const entries: unknown[] = [];
    const logger = createStructuredLogger({
      sink: (entry) => entries.push(entry),
    });
    logger.log('info', 'event', { items: [{ secret: 'x' }, { data: 'y' }] });
    const entry = entries[0] as { meta: { items: Array<Record<string, unknown>> } };
    expect(entry.meta.items[0].secret).toBe('[REDACTED]');
    expect(entry.meta.items[1].data).toBe('y');
  });

  it('redact handles null and undefined', () => {
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
  });

  it('redact handles numbers and booleans', () => {
    expect(redact(42)).toBe(42);
    expect(redact(true)).toBe(true);
  });

  it('createJsonConsoleSink emits parseable JSON', () => {
    const lines: string[] = [];
    const sink = createJsonConsoleSink();
    // eslint-disable-next-line no-console
    const originalLog = console.log;
    // eslint-disable-next-line no-console
    console.log = (line: string) => lines.push(line);
    try {
      sink({
        timestamp: '2026-08-09T16:00:00.000Z',
        level: 'info',
        message: 'hello',
        traceId: 'trace-1',
        spanId: 'span-1',
      });
    } finally {
      // eslint-disable-next-line no-console
      console.log = originalLog;
    }
    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('hello');
    expect(parsed.traceId).toBe('trace-1');
    expect(parsed.spanId).toBe('span-1');
  });
});
