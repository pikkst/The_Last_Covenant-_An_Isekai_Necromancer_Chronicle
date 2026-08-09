import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '@tlc/contracts';
import { SessionService } from '../session.service';
import { ConfigService } from '../../config.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Record<string, unknown>;
    const token = this.extractToken(request);

    if (!token) {
      request.user = null;
      request.session = null;
      return true;
    }

    return this.validateToken(request, token);
  }

  private async validateToken(request: Record<string, unknown>, token: string): Promise<boolean> {
    try {
      this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.get('JWT_ACCESS_SECRET') as string,
      });
    } catch {
      request.user = null;
      request.session = null;
      return true;
    }

    try {
      const result = await this.sessionService.validateAccessToken(token);
      request.user = result.account;
      request.session = result.session;
    } catch {
      request.user = null;
      request.session = null;
    }
    return true;
  }

  private extractToken(request: Record<string, unknown>): string | undefined {
    const headers = request.headers as Record<string, string | undefined> | undefined;
    const authHeader = headers?.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) return token;
    }

    const cookies = request.cookies as Record<string, string> | undefined;
    if (cookies?.accessToken) return cookies.accessToken;
    return undefined;
  }
}
