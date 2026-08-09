import { describe, it, expect, beforeAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';

describe('api app', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  it('is wired up', () => {
    expect(app).toBeDefined();
  });

  it('exposes /health/liveness', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health/liveness').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('exposes /health/readiness', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health/readiness').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('exposes /health', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('exposes /metrics', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/metrics').expect(200);
    expect(res.body.format).toBe('json');
    expect(Array.isArray(res.body.metrics)).toBe(true);
  });

  it('returns trace id header on responses', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.headers['x-request-id']).toBeTruthy();
  });
});
