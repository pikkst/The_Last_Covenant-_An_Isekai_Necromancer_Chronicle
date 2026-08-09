import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { createTraceContext, type TraceContext } from '@tlc/contracts';
import { createStructuredLogger, createJsonConsoleSink, type Logger, type LogLevel, type Counter, type Histogram } from '@tlc/observability';
import { getTracer } from '@tlc/observability';
import { InMemoryMetrics } from '@tlc/observability';

@Injectable()
export class TraceContextMiddleware implements NestMiddleware {
  private readonly logger: Logger;
  private readonly tracer = getTracer();
  private readonly requestCounter: Counter;
  private readonly requestDuration: Histogram;

  constructor(@Inject(InMemoryMetrics) metrics: InMemoryMetrics) {
    this.logger = createStructuredLogger({
      sink: createJsonConsoleSink(),
    });
    this.requestCounter = metrics.counter('http_requests_total', 'HTTP request count', ['method', 'path', 'status']);
    this.requestDuration = metrics.histogram('http_request_duration_seconds', 'HTTP request duration', undefined, ['method', 'path']);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const traceId = (req.headers['x-request-id'] as string | undefined) ?? undefined;
    const traceContext = createTraceContext(traceId);

    (req as Request & { traceContext: TraceContext }).traceContext = traceContext;
    res.setHeader('x-request-id', traceContext.traceId);

    const method = req.method;
    const path = this.sanitizePath(req.originalUrl || req.url);
    const start = Date.now();
    const requestLogger = this.logger.child({ traceId: traceContext.traceId, spanId: traceContext.spanId });

    const span = this.tracer.startSpan('request', { method, path }, traceContext);

    requestLogger.log('info', 'request.start', { method, path });

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const durationSeconds = durationMs / 1000;
      const statusCode = res.statusCode;
      const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

      requestLogger.log(level, 'request.finish', {
        method,
        path,
        statusCode,
        durationMs,
      });

      this.requestCounter.increment(1, { method, path, status: String(statusCode) });
      this.requestDuration.observe(durationSeconds, { method, path });

      span.setAttribute('http.status_code', statusCode);
      span.setAttribute('http.method', method);
      span.setAttribute('http.route', path);
      span.setAttribute('duration_ms', durationMs);
      span.end();
    });

    next();
  }

  private sanitizePath(url: string): string {
    try {
      const sanitized = new URL(url, 'http://localhost');
      sanitized.search = '';
      return sanitized.pathname + sanitized.hash;
    } catch {
      return url.split('?')[0] || url;
    }
  }
}
