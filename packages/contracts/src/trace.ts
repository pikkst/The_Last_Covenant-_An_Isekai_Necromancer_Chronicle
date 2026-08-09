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
  const sampled = ctx.sampled ? '01' : '00';
  return {
    traceparent: `00-${ctx.traceId}-${ctx.spanId}-${sampled}`,
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

function generateId(hexLength: number): string {
  const byteLength = Math.ceil(hexLength / 2);
  const bytes = new Uint8Array(byteLength);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = (Math.random() * 256) | 0;
    }
  }
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, hexLength);
}

export function validateTraceContext(ctx: TraceContext): boolean {
  return /^[0-9a-f]{32}$/.test(ctx.traceId) && /^[0-9a-f]{16}$/.test(ctx.spanId);
}
