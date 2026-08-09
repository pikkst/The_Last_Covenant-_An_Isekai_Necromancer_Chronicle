import { Injectable } from '@nestjs/common';
import type { EnvConfig } from './config';

@Injectable()
export class ConfigService {
  private readonly config: EnvConfig;

  constructor() {
    this.config = {
      NODE_ENV: (process.env.NODE_ENV ?? 'development') as EnvConfig['NODE_ENV'],
      PORT: Number(process.env.PORT ?? 3001),
      DATABASE_URL: process.env.DATABASE_URL ?? '',
      REDIS_URL: process.env.REDIS_URL ?? '',
      JWT_SECRET: process.env.JWT_SECRET ?? 'change-me-in-production',
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'change-me-in-production',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'change-me-in-production',
      JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY ?? '15m',
      JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY ?? '7d',
      RESET_TOKEN_EXPIRY: process.env.RESET_TOKEN_EXPIRY ?? '1h',
      SESSION_TTL_DAYS: Number(process.env.SESSION_TTL_DAYS ?? 7),
      RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
      RATE_LIMIT_MAX_ATTEMPTS: Number(process.env.RATE_LIMIT_MAX_ATTEMPTS ?? 5),
      SAVE_SLOT_QUOTA: Number(process.env.SAVE_SLOT_QUOTA ?? 10),
    };
  }

  get(key: keyof EnvConfig): string | number {
    return this.config[key] as string | number;
  }
}
