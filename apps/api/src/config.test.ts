import { describe, it, expect } from 'vitest';
import { envSchema, validateEnv } from './config';

const baseEnv = {
  NODE_ENV: 'development' as const,
  PORT: 3001,
  DATABASE_URL: 'postgresql://localhost:5432/db',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'secret',
  JWT_ACCESS_SECRET: 'access-secret',
  JWT_REFRESH_SECRET: 'refresh-secret',
};

describe('config', () => {
  it('validates required fields', () => {
    const result = envSchema.safeParse(baseEnv);
    expect(result.success).toBe(true);
  });

  it('rejects invalid port type', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      PORT: 'not-a-number',
    });
    expect(result.success).toBe(false);
  });

  it('rejects fractional ports', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      PORT: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects port 0', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      PORT: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects port above 65535', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      PORT: 70000,
    });
    expect(result.success).toBe(false);
  });

  it('accepts port 1', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      PORT: 1,
    });
    expect(result.success).toBe(true);
  });

  it('accepts port 65535', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      PORT: 65535,
    });
    expect(result.success).toBe(true);
  });

  it('throws on missing required env', () => {
    const prev = { ...process.env };
    delete process.env.DATABASE_URL;
    delete process.env.REDIS_URL;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    expect(() => validateEnv()).toThrow();
    process.env = prev;
  });
});
