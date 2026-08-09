import { describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TraceContextMiddleware } from './trace-context.middleware';
import { InMemoryMetrics } from '@tlc/observability';
import { AppModule } from '../app.module';

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

  it('generates valid traceId when x-request-id is invalid', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    const res = await request(app.getHttpServer()).get('/api/v1/health').set('x-request-id', 'invalid-id');
    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toHaveLength(32);
    expect(res.headers['x-request-id']).not.toBe('invalid-id');

    await app.close();
  });

  it('preserves valid x-request-id', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    const validId = 'abcdef0123456789abcdef0123456789';
    const res = await request(app.getHttpServer()).get('/api/v1/health').set('x-request-id', validId);
    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBe(validId);

    await app.close();
  });
});
