import { describe, it, expect } from 'vitest';
import { TraceContextMiddleware } from './trace-context.middleware';
import { InMemoryMetrics } from '@tlc/observability';

describe('TraceContextMiddleware', () => {
  it('strips query parameters from logged path', () => {
    const metrics = new InMemoryMetrics();
    const middleware = new TraceContextMiddleware(metrics);

    const sanitized = (middleware as unknown as { sanitizePath: (url: string) => string }).sanitizePath('/api/v1/reset?token=secret123&foo=bar');
    expect(sanitized).toBe('/api/v1/reset');
  });

  it('preserves path and hash without query', () => {
    const metrics = new InMemoryMetrics();
    const middleware = new TraceContextMiddleware(metrics);

    const sanitized = (middleware as unknown as { sanitizePath: (url: string) => string }).sanitizePath('/api/v1/page#section');
    expect(sanitized).toBe('/api/v1/page#section');
  });

  it('handles invalid url gracefully', () => {
    const metrics = new InMemoryMetrics();
    const middleware = new TraceContextMiddleware(metrics);

    const sanitized = (middleware as unknown as { sanitizePath: (url: string) => string }).sanitizePath('/not-a-url?token=secret');
    expect(sanitized).toBe('/not-a-url');
  });
});
