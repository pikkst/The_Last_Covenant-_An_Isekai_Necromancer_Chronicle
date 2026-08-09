import { describe, it, expect } from 'vitest';
import { envSchema, validateEnv } from './config';

describe('config', () => {
  it('validates required fields', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'development',
      PORT: 3001,
      DATABASE_URL: 'postgresql://localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'secret',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid port', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'development',
      PORT: 'not-a-number',
      DATABASE_URL: 'postgresql://localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'secret',
    });
    expect(result.success).toBe(false);
  });

  it('throws on missing required env', () => {
    const prev = { ...process.env };
    delete process.env.DATABASE_URL;
    delete process.env.REDIS_URL;
    delete process.env.JWT_SECRET;
    expect(() => validateEnv()).toThrow();
    process.env = prev;
  });
});
