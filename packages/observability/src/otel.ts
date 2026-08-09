import type { TraceContext } from '@tlc/contracts';
import type { Span, Tracer } from './tracer';
import { NoOpTracer } from './tracer';

let tracer: Tracer | undefined;
let sdkInitialized = false;
let memoryExporter: { finishedSpans: unknown[] } | undefined;

export function getTracer(): Tracer {
  if (!tracer) {
    tracer = createOpenTelemetryTracer();
  }
  return tracer;
}

export function getMemoryExporter(): { finishedSpans: unknown[] } | undefined {
  return memoryExporter;
}

export function resetOpenTelemetry(): void {
  tracer = undefined;
  sdkInitialized = false;
  memoryExporter = undefined;
}

function createOpenTelemetryTracer(): Tracer {
  try {
    initializeOpenTelemetry();
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

function initializeOpenTelemetry(): void {
  if (sdkInitialized) return;
  sdkInitialized = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NodeTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor, NoopSpanExporter, InMemorySpanExporter } = require('@opentelemetry/sdk-trace-node') as {
      NodeTracerProvider: new (config: unknown) => { register: () => void; addSpanProcessor: (p: unknown) => void };
      ConsoleSpanExporter: new () => unknown;
      SimpleSpanProcessor: new (exporter: unknown) => unknown;
      NoopSpanExporter: new () => unknown;
      InMemorySpanExporter: new () => { _finishedSpans: unknown[] };
    };

    const exporterType = (process.env.OTEL_EXPORTER_TYPE || 'noop').toLowerCase();

    let exporter: unknown;
    if (exporterType === 'console') {
      exporter = new ConsoleSpanExporter();
    } else if (exporterType === 'memory') {
      exporter = new InMemorySpanExporter();
      memoryExporter = { finishedSpans: (exporter as { _finishedSpans: unknown[] })._finishedSpans };
    } else {
      exporter = new NoopSpanExporter();
    }

    const provider = new NodeTracerProvider({});

    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    provider.register();
  } catch {
    // If SDK bootstrap fails, fall back to API no-op behavior
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
