/* eslint-disable no-console */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly meta?: Record<string, unknown>;
}

export interface Logger {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
  child(context: Record<string, unknown>): Logger;
}

const REDACTED = '[REDACTED]';
const SECRET_KEYS = new Set([
  'password',
  'secret',
  'token',
  'authorization',
  'cookie',
  'setcookie',
  'x-csrf-token',
  'idempotencykey',
]);

const SECRET_PATTERNS = [
  /^Bearer\s+[A-Za-z0-9\-._~+/]+=*$/i,
  /^[A-Za-z0-9\-._~+/]{32,}=*$/i,
];

export function redact(value: unknown, key?: string): unknown {
  if (value === null || value === undefined) return value;
  if (typeof key === 'string' && SECRET_KEYS.has(key.toLowerCase())) {
    return REDACTED;
  }
  if (typeof value === 'string') {
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(value)) {
        return REDACTED;
      }
    }
  }
  if (Array.isArray(value)) {
    return value.map((item) => redact(item, key));
  }
  if (typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[k] = redact((value as Record<string, unknown>)[k], k);
    }
    return sorted;
  }
  return value;
}

export function createStructuredLogger(options?: {
  traceContext?: { traceId?: string; spanId?: string };
  sink?: (entry: LogEntry) => void;
}): Logger {
  const { sink, traceContext } = options ?? {};
  const sinkFn = sink ?? ((entry: LogEntry) => console.log(JSON.stringify(entry)));

  const baseContext: Record<string, unknown> = {};
  if (traceContext?.traceId) baseContext.traceId = traceContext.traceId;
  if (traceContext?.spanId) baseContext.spanId = traceContext.spanId;

  const logger: Logger = {
    log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(baseContext.traceId ? { traceId: baseContext.traceId as string } : {}),
        ...(baseContext.spanId ? { spanId: baseContext.spanId as string } : {}),
        ...(meta ? { meta: redact(meta) as Record<string, unknown> } : {}),
      };
      sinkFn(entry);
    },
    child(context: Record<string, unknown>): Logger {
      const childContext: Record<string, unknown> = { ...baseContext, ...context };
      return createStructuredLogger({
        traceContext: childContext.traceId ? { traceId: childContext.traceId as string, spanId: childContext.spanId as string } : traceContext,
        sink: sinkFn,
      });
    },
  };

  return logger;
}

export const noopLogger: Logger = {
  log: () => {},
  child: () => noopLogger,
};
