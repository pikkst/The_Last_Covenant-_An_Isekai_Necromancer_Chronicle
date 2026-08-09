import type { TraceContext } from '@tlc/contracts';

export interface Span {
  setAttribute(key: string, value: unknown): void;
  setError(error: Error): void;
  end(): void;
}

export interface Tracer {
  startSpan(name: string, attributes?: Record<string, unknown>, traceContext?: TraceContext): Span;
  withSpan<T>(name: string, attributes: Record<string, unknown>, traceContext: TraceContext, fn: (span: Span) => Promise<T>): Promise<T>;
}

export class NoOpTracer implements Tracer {
  startSpan(): Span {
    return new NoOpSpan();
  }
  async withSpan<T>(_name: string, _attributes: Record<string, unknown>, _traceContext: TraceContext, fn: (span: Span) => Promise<T>): Promise<T> {
    return fn(new NoOpSpan());
  }
}

class NoOpSpan implements Span {
  setAttribute(): void {}
  setError(): void {}
  end(): void {}
}
