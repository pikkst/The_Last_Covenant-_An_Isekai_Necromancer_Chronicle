import type { TraceContext } from '@tlc/contracts';
import type { Span, Tracer } from './tracer';
import { NoOpTracer } from './tracer';

let tracer: Tracer | undefined;

export function getTracer(): Tracer {
  if (!tracer) {
    tracer = createOpenTelemetryTracer();
  }
  return tracer;
}

function createOpenTelemetryTracer(): Tracer {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const api = require('@opentelemetry/api');
    const apiTracer = api.trace.getTracer('@tlc/observability');
    const impl = {
      startSpan: (name: string, attributes?: Record<string, unknown>): Span => {
        const span = apiTracer.startSpan(name, attributes);
        return new OpenTelemetrySpan(span);
      },
      withSpan: async (name: string, attributes: Record<string, unknown>, traceContext: TraceContext, fn: (span: Span) => Promise<unknown>) => {
        const span = getTracer().startSpan(name, attributes, traceContext);
        try {
          return await fn(span);
        } finally {
          span.end();
        }
      },
    } as Tracer;
    return impl;
  } catch {
    return new NoOpTracer();
  }
}

interface OpenTelemetrySpanHandle {
  setAttribute(key: string, value: unknown): void;
  recordException(error: Error): void;
  end(): void;
}

class OpenTelemetrySpan implements Span {
  constructor(private readonly span: OpenTelemetrySpanHandle) {}

  setAttribute(key: string, value: unknown): void {
    this.span.setAttribute(key, value);
  }

  setError(error: Error): void {
    this.span.recordException(error);
  }

  end(): void {
    this.span.end();
  }
}
