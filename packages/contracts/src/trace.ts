export interface TraceContext {
  readonly traceId: string;
  readonly spanId: string;
  readonly sampled?: boolean;
}

export function createTraceContext(traceId?: string, spanId?: string): TraceContext {
  const generatedTraceId = generateId(32);
  const generatedSpanId = generateId(16);
  const isValidTraceId = typeof traceId === 'string' && /^[0-9a-f]{32}$/.test(traceId) && !/^0+$/.test(traceId);
  const isValidSpanId = typeof spanId === 'string' && /^[0-9a-f]{16}$/.test(spanId) && !/^0+$/.test(spanId);
  return {
    traceId: isValidTraceId ? traceId : generatedTraceId,
    spanId: isValidSpanId ? spanId : generatedSpanId,
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
  const traceId = match[2]!;
  const spanId = match[3]!;
  if (/^0+$/.test(traceId) || /^0+$/.test(spanId)) return undefined;
  return {
    traceId,
    spanId,
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
  return /^[0-9a-f]{32}$/.test(ctx.traceId) && /^[0-9a-f]{16}$/.test(ctx.spanId) && !/^0+$/.test(ctx.traceId) && !/^0+$/.test(ctx.spanId);
}
