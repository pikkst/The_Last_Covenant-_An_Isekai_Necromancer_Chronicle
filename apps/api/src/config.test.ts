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

  it('rejects invalid port type', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'development',
      PORT: 'not-a-number',
      DATABASE_URL: 'postgresql://localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'secret',
    });
    expect(result.success).toBe(false);
  });

  it('rejects fractional ports', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'development',
      PORT: 1.5,
      DATABASE_URL: 'postgresql://localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'secret',
    });
    expect(result.success).toBe(false);
  });

  it('rejects port 0', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'development',
      PORT: 0,
      DATABASE_URL: 'postgresql://localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'secret',
    });
    expect(result.success).toBe(false);
  });

  it('rejects port above 65535', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'development',
      PORT: 70000,
      DATABASE_URL: 'postgresql://localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'secret',
    });
    expect(result.success).toBe(false);
  });

  it('accepts port 1', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'development',
      PORT: 1,
      DATABASE_URL: 'postgresql://localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'secret',
    });
    expect(result.success).toBe(true);
  });

  it('accepts port 65535', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'development',
      PORT: 65535,
      DATABASE_URL: 'postgresql://localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'secret',
    });
    expect(result.success).toBe(true);
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
