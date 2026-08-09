import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config.service';
import { AppError, ErrorCode } from '@tlc/contracts';
import type { JwtPayload } from '@tlc/contracts';
import type { Account, Session } from '@prisma/client';
import * as crypto from 'crypto';

export interface SessionInfo {
  sessionId: string;
  familyId: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
  refreshToken: string;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createSession(account: Account, userAgent?: string, ipHash?: string): Promise<SessionInfo> {
    const now = new Date();
    const accessTtl = this.parseTtl(this.config.get('JWT_ACCESS_EXPIRY') as string);
    const refreshTtlDays = this.config.get('SESSION_TTL_DAYS') as number;
    const familyId = this.generateFamilyId();
    const sessionId = this.generateSessionId();
    const refreshToken = this.generateSecureToken();
    const refreshExpiresAt = new Date(now.getTime() + refreshTtlDays * 24 * 60 * 60 * 1000);

    await this.prisma.session.create({
      data: {
        accountId: account.id,
        tokenHash: this.hashToken(refreshToken),
        familyId,
        expiresAt: refreshExpiresAt,
        lastSeenAt: now,
        userAgent,
        ipHash,
      },
    });

    return {
      sessionId,
      familyId,
      accessExpiresAt: new Date(now.getTime() + accessTtl),
      refreshExpiresAt,
      refreshToken,
    };
  }

  async validateAccessToken(accessToken: string): Promise<{ account: Account; session: Session }> {
    let payload: JwtPayload;
    try {
      const { JwtService } = await import('@nestjs/jwt');
      const jwtService = new JwtService({ secret: this.config.get('JWT_ACCESS_SECRET') as string });
      payload = jwtService.verify<JwtPayload>(accessToken);
    } catch {
      throw new AppError(ErrorCode.AUTH_INVALID_TOKEN, 'Invalid access token');
    }

    const session = await this.prisma.session.findFirst({
      where: {
        accountId: payload.sub,
        familyId: payload.familyId,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!session) {
      throw new AppError(ErrorCode.AUTH_SESSION_NOT_FOUND, 'Session not found');
    }

    if (session.expiresAt < new Date()) {
      throw new AppError(ErrorCode.AUTH_SESSION_EXPIRED, 'Session expired');
    }

    const account = await this.prisma.account.findFirst({
      where: { id: payload.sub, deletedAt: null },
    });

    if (!account) {
      throw new AppError(ErrorCode.AUTH_ACCOUNT_NOT_FOUND, 'Account not found');
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    return { account, session };
  }

  async rotateSession(refreshToken: string, userAgent?: string, ipHash?: string): Promise<{ accessToken: string; refreshToken: string; session: Session }> {
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.prisma.session.findFirst({
      where: { tokenHash, revokedAt: null },
    });

    if (!session) {
      throw new AppError(ErrorCode.AUTH_SESSION_NOT_FOUND, 'Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      throw new AppError(ErrorCode.AUTH_SESSION_EXPIRED, 'Refresh token expired');
    }

    const account = await this.prisma.account.findFirst({
      where: { id: session.accountId, deletedAt: null },
    });

    if (!account) {
      throw new AppError(ErrorCode.AUTH_ACCOUNT_NOT_FOUND, 'Account not found');
    }

    const newFamilyId = this.generateFamilyId();
    const newRefreshToken = this.generateSecureToken();
    const { JwtService } = await import('@nestjs/jwt');
    const jwtService = new JwtService({ secret: this.config.get('JWT_ACCESS_SECRET') as string });
    const accessToken = jwtService.sign(
      {
        sub: account.id,
        email: account.email,
        status: account.status as JwtPayload['status'],
        locale: account.locale,
        sessionId: session.id,
        familyId: newFamilyId,
      },
      {
        secret: this.config.get('JWT_ACCESS_SECRET') as string,
        expiresIn: this.config.get('JWT_ACCESS_EXPIRY') as string,
      },
    );

    const now = new Date();
    const refreshTtlDays = this.config.get('SESSION_TTL_DAYS') as number;
    const refreshExpiresAt = new Date(now.getTime() + refreshTtlDays * 24 * 60 * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: now },
      }),
      this.prisma.session.create({
        data: {
          accountId: account.id,
          tokenHash: this.hashToken(newRefreshToken),
          familyId: newFamilyId,
          expiresAt: refreshExpiresAt,
          lastSeenAt: now,
          userAgent,
          ipHash,
        },
      }),
    ]);

    const newSession = await this.prisma.session.findFirst({
      where: { accountId: account.id, familyId: newFamilyId },
      orderBy: { createdAt: 'desc' },
    });

    if (!newSession) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to create rotated session');
    }

    return { accessToken, refreshToken: newRefreshToken, session: newSession };
  }

  async revokeSession(sessionId: string, accountId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, accountId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllSessions(accountId: string, exceptSessionId?: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        accountId,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  private generateFamilyId(): string {
    return `fam_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private generateSessionId(): string {
    return `ses_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private generateSecureToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseTtl(ttl: string): number {
    const match = ttl.match(/^(\d+)([mhsd])$/);
    if (!match) return 15 * 60 * 1000;
    const value = Number(match[1]);
    const unit = match[2];
    switch (unit) {
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return value * 1000;
    }
  }
}
