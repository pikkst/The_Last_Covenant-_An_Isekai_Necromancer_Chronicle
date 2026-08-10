import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimitService } from './rate-limit.service';
import { ConfigService } from '../config.service';

const mockConfig = {
  get: vi.fn((key: string) => {
    const defaults: Record<string, string | number> = {
      RATE_LIMIT_WINDOW_MS: 60000,
      RATE_LIMIT_MAX_ATTEMPTS: 5,
      REDIS_URL: '',
    };
    return defaults[key] ?? '';
  }),
};

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RateLimitService(mockConfig as unknown as ConfigService);
  });

  it('allows requests within limit', async () => {
    const result = await service.checkLimit('test:1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blocks requests exceeding limit', async () => {
    for (let i = 0; i < 5; i++) {
      await service.checkLimit('test:2');
    }
    const result = await service.checkLimit('test:2');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('resets limit after reset call', async () => {
    for (let i = 0; i < 5; i++) {
      await service.checkLimit('test:3');
    }
    await service.resetLimit('test:3');
    const result = await service.checkLimit('test:3');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });
});
