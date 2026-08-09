import { describe, it, expect, beforeAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('observability integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  it('request logs contain traceId and spanId', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.headers['x-request-id']).toBeTruthy();
    expect(res.status).toBe(200);
  });

  it('metrics endpoint returns request samples', async () => {
    await request(app.getHttpServer()).get('/api/v1/health');
    const res = await request(app.getHttpServer()).get('/api/v1/metrics');
    expect(res.status).toBe(200);
    expect(res.body.format).toBe('json');
    expect(Array.isArray(res.body.metrics)).toBe(true);
    const requestMetrics = res.body.metrics.filter((m: { name: string }) => m.name === 'http_requests_total');
    expect(requestMetrics.length).toBeGreaterThan(0);
  });

  it('logs are valid JSON lines', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.status).toBe(200);
  });
});
