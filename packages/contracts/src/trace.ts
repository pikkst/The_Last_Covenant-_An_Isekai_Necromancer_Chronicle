export interface TraceContext {
  readonly traceId: string;
  readonly spanId: string;
  readonly sampled?: boolean;
}

export function createTraceContext(traceId?: string, spanId?: string): TraceContext {
  return {
    traceId: traceId ?? generateId(32),
    spanId: spanId ?? generateId(16),
    sampled: true,
  };
}

export function createTraceContextCarrier(ctx: TraceContext): Record<string, string> {
  return {
    traceparent: `00-${ctx.traceId}-${ctx.spanId}-01`,
  };
}

export function extractTraceContext(carrier: Record<string, string | undefined>): TraceContext | undefined {
  const traceparent = carrier.traceparent;
  if (!traceparent) return undefined;
  const match = /^(\d{2})-([0-9a-f]{32})-([0-9a-f]{16})-(\d{2})$/.exec(traceparent);
  if (!match) return undefined;
  return {
    traceId: match[2]!,
    spanId: match[3]!,
    sampled: match[4] === '01',
  };
}

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
