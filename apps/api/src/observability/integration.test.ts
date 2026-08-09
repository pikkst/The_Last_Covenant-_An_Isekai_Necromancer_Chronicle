import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { GenericExceptionFilter } from './errors.filter';
import { getMemoryExporter, resetOpenTelemetry } from '@tlc/observability';

describe('observability integration', () => {
  let app: INestApplication;
  const lines: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;

  beforeAll(async () => {
    console.log = (line: string) => lines.push(line);
    console.error = (line: string) => lines.push(line);
    resetOpenTelemetry();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new GenericExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    console.log = originalLog;
    console.error = originalError;
    await app.close();
  });

  it('response header, request logs, and exported span share the same traceId', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.headers['x-request-id']).toBeTruthy();
    expect(res.status).toBe(200);
    const traceId = res.headers['x-request-id'] as string;

    const startLog = lines.find((l) => l.includes('"message":"request.start"'));
    const finishLog = lines.find((l) => l.includes('"message":"request.finish"'));
    expect(startLog).toBeTruthy();
    expect(finishLog).toBeTruthy();

    const startParsed = JSON.parse(startLog!);
    const finishParsed = JSON.parse(finishLog!);
    expect(startParsed.traceId).toBe(traceId);
    expect(finishParsed.traceId).toBe(traceId);
    expect(startParsed.spanId).toBeTruthy();
    expect(finishParsed.spanId).toBe(startParsed.spanId);

    const exporter = getMemoryExporter();
    if (exporter) {
      const requestSpan = exporter.finishedSpans.find((span: unknown) => {
        const s = span as { name?: string };
        return s.name === 'request';
      });
      expect(requestSpan).toBeTruthy();
      const spanContext = (requestSpan as { spanContext?: { traceId?: string } }).spanContext;
      expect(spanContext?.traceId).toBe(traceId);
    }
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

  it('error logs retain traceId at top level', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    const traceId = res.headers['x-request-id'] as string;

    const errorLog = lines.find((l) => {
      try {
        const parsed = JSON.parse(l);
        return parsed.level === 'error' && parsed.traceId === traceId;
      } catch {
        return false;
      }
    });
    expect(errorLog).toBeTruthy();
  });
});
