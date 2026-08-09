import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppErrorFilter, GenericExceptionFilter } from './errors.filter';
import { TestErrorController } from './test-error.controller';

describe('errors.filter', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestErrorController],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AppErrorFilter(), new GenericExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('masks AppError message for 5xx responses', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/test-errors/internal');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toBe('Internal server error');
    expect(res.body.error.message).not.toContain('Database connection failed');
  });

  it('preserves AppError message for non-5xx responses', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/test-errors/not-found');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Resource not found');
  });
});
