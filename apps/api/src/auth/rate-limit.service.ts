import { Injectable, Scope } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '../config.service';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable({ scope: Scope.REQUEST })
export class RateLimitService {
  private readonly limits = new Map<string, RateLimitEntry>();
  private _redis?: Redis;

  constructor(private readonly config: ConfigService) {}

  private async getRedis(): Promise<Redis | undefined> {
    if (this._redis) return this._redis;
    try {
      const url = this.config.get('REDIS_URL') as string;
      if (!url) return undefined;
      this._redis = new Redis(url);
      this._redis.on('error', () => {});
      return this._redis;
    } catch {
      return undefined;
    }
  }

  async checkLimit(key: string): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
    const windowMs = this.config.get('RATE_LIMIT_WINDOW_MS') as number;
    const maxAttempts = this.config.get('RATE_LIMIT_MAX_ATTEMPTS') as number;
    const redis = await this.getRedis();

    if (redis) {
      try {
        const count = await redis.incr(`ratelimit:${key}`);
        if (count === 1) {
          await redis.pexpire(`ratelimit:${key}`, windowMs);
        }
        const ttl = await redis.pttl(`ratelimit:${key}`);
        const remaining = Math.max(0, maxAttempts - count);
        return {
          allowed: count <= maxAttempts,
          remaining,
          retryAfterMs: count > maxAttempts ? ttl : 0,
        };
      } catch {
        // Fall through to in-memory if Redis fails
      }
    }

    const now = Date.now();
    const entry = this.limits.get(key);
    if (!entry || now > entry.resetAt) {
      this.limits.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxAttempts - 1, retryAfterMs: 0 };
    }

    entry.count += 1;
    const remaining = Math.max(0, maxAttempts - entry.count);
    const retryAfterMs = entry.resetAt - now;
    return {
      allowed: entry.count <= maxAttempts,
      remaining,
      retryAfterMs: entry.count > maxAttempts ? retryAfterMs : 0,
    };
  }

  async resetLimit(key: string): Promise<void> {
    const redis = await this.getRedis();
    if (redis) {
      try {
        await redis.del(`ratelimit:${key}`);
      } catch {
        // ignore
      }
    } else {
      this.limits.delete(key);
    }
  }
}
