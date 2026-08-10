import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '@tlc/contracts';
import { AppError, ErrorCode } from '@tlc/contracts';
import { SessionService } from '../session.service';
import { ConfigService } from '../../config.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Record<string, unknown>;
    const response = context.switchToHttp().getResponse() as Record<string, unknown>;

    const token = this.extractToken(request);
    if (!token) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Missing access token');
    }

    try {
      void this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.get('JWT_ACCESS_SECRET') as string,
      });
    } catch {
      throw new AppError(ErrorCode.AUTH_INVALID_TOKEN, 'Invalid access token');
    }

    try {
      const result = await this.sessionService.validateAccessToken(token);
      request.user = result.account;
      request.session = result.session;
      return true;
    } catch (e) {
      if (e instanceof AppError && e.code === ErrorCode.AUTH_SESSION_NOT_FOUND) {
        this.clearAuthCookies(response);
      }
      throw e;
    }
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

  private clearAuthCookies(response: Record<string, unknown>): void {
    if (typeof response.cookie === 'function') {
      response.cookie('accessToken', '', { httpOnly: true, expires: new Date(0), path: '/' });
      response.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0), path: '/' });
    }
  }
}
