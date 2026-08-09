import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { createTraceContext, type TraceContext } from '@tlc/contracts';
import { createStructuredLogger, type Logger, type LogLevel } from '@tlc/observability';
import { getTracer } from '@tlc/observability';

function generateId(length: number): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = (Math.random() * 256) | 0;
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

@Injectable()
export class TraceContextMiddleware implements NestMiddleware {
  private readonly logger: Logger;
  private readonly tracer = getTracer();

  constructor() {
    this.logger = createStructuredLogger({
      sink: (entry) => this.writeLog(entry),
    });
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const traceId = (req.headers['x-request-id'] as string | undefined) ?? generateId(32);
    const spanId = generateId(16);
    const traceContext = createTraceContext(traceId, spanId);

    (req as Request & { traceContext: TraceContext }).traceContext = traceContext;
    res.setHeader('x-request-id', traceId);

    const method = req.method;
    const url = req.originalUrl || req.url;
    const start = Date.now();

    this.logger.log('info', 'request.start', { method, url });

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const level: LogLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      this.logger.log(level, 'request.finish', {
        method,
        url,
        statusCode: res.statusCode,
        durationMs,
      });
    });

    next();
  }

  private writeLog(entry: { level: LogLevel; message: string; timestamp: string; traceId?: string; spanId?: string; meta?: Record<string, unknown> }): void {
    const logEntry = {
      ...entry,
      level: entry.level.toUpperCase(),
    };
    switch (entry.level) {
      case 'error':
        console.error(logEntry);
        break;
      case 'warn':
        console.warn(logEntry);
        break;
      case 'debug':
        console.debug(logEntry);
        break;
      default:
        console.log(logEntry);
    }
  }
}
