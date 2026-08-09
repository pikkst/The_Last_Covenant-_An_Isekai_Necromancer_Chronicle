import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { RateLimitService } from '../rate-limit.service';
import { AuditService } from '../audit.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ route?: { path?: string }; url?: string; body?: Record<string, unknown>; ip?: string }>();
    const traceId = (request as { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const key = this.buildKey(request);
    const result = await this.rateLimitService.checkLimit(key);

    if (!result.allowed) {
      await this.auditService.log({
        category: 'auth',
        action: key.split(':')[0] ?? 'unknown',
        outcome: 'rate_limited',
        traceId,
        metadata: { key, retryAfterMs: result.retryAfterMs },
      });
      throw new BadRequestException({
        error: {
          code: 'AUTH_RATE_LIMITED',
          message: 'Too many requests. Try again later.',
          details: { retryAfterMs: result.retryAfterMs },
        },
      });
    }

    return true;
  }

  private buildKey(request: { route?: { path?: string }; url?: string; body?: Record<string, unknown>; ip?: string }): string {
    const route = request.route?.path ?? request.url ?? 'unknown';
    const identifier = request.body?.email ?? request.ip ?? 'unknown';
    return `${route}:${identifier}`;
  }
}
