import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AppError, ErrorCode } from '@tlc/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config.service';
import { SessionService } from './session.service';
import { AuditService } from './audit.service';
import { RateLimitService } from './rate-limit.service';
import type { AccountStatus, JwtPayload } from '@tlc/contracts';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async register(email: string, password: string, traceId?: string): Promise<{ accessToken: string; refreshToken: string; accountId: string; email: string; status: AccountStatus }> {
    const normalizedEmail = email.toLowerCase().trim();

    const rateLimit = await this.rateLimitService.checkLimit(`register:${this.hashIp(normalizedEmail)}`);
    if (!rateLimit.allowed) {
      await this.auditService.log({
        category: 'auth',
        action: 'register',
        outcome: 'rate_limited',
        traceId,
        metadata: { email: this.redactEmail(normalizedEmail) },
      });
      throw new AppError(ErrorCode.AUTH_RATE_LIMITED, 'Too many registration attempts. Try again later.');
    }

    const existing = await this.prisma.account.findFirst({
      where: { emailNormalized: normalizedEmail },
    });

    if (existing) {
      await this.auditService.log({
        category: 'auth',
        action: 'register',
        outcome: 'email_exists',
        traceId,
        metadata: { email: this.redactEmail(normalizedEmail) },
      });
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const account = await this.prisma.account.create({
      data: {
        email: normalizedEmail,
        emailNormalized: normalizedEmail,
        passwordHash,
      },
    });

    await this.rateLimitService.resetLimit(`register:${this.hashIp(normalizedEmail)}`);

    const sessionInfo = await this.sessionService.createSession(account);

    await this.auditService.log({
      accountId: account.id,
      category: 'auth',
      action: 'register',
      outcome: 'success',
      traceId,
      metadata: { email: this.redactEmail(normalizedEmail) },
    });

    return {
      accessToken: this.createAccessToken(account, sessionInfo),
      refreshToken: sessionInfo.refreshToken,
      accountId: account.id,
      email: account.email,
      status: account.status as AccountStatus,
    };
  }

  async login(email: string, password: string, traceId?: string, userAgent?: string, ipHash?: string): Promise<{ accessToken: string; refreshToken: string; accountId: string; email: string; status: AccountStatus }> {
    const normalizedEmail = email.toLowerCase().trim();
    const rateLimitKey = `login:${this.hashIp(normalizedEmail)}`;
    const rateLimit = await this.rateLimitService.checkLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      await this.auditService.log({
        category: 'auth',
        action: 'login',
        outcome: 'rate_limited',
        traceId,
        metadata: { email: this.redactEmail(normalizedEmail) },
      });
      throw new AppError(ErrorCode.AUTH_RATE_LIMITED, 'Too many login attempts. Try again later.');
    }

    const account = await this.prisma.account.findFirst({
      where: { emailNormalized: normalizedEmail, deletedAt: null },
    });

    if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
      await this.auditService.log({
        accountId: account?.id,
        category: 'auth',
        action: 'login',
        outcome: 'invalid_credentials',
        traceId,
        metadata: { email: this.redactEmail(normalizedEmail) },
      });
      throw new AppError(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password.');
    }

    await this.rateLimitService.resetLimit(rateLimitKey);

    if (account.status === 'SUSPENDED') {
      await this.auditService.log({
        accountId: account.id,
        category: 'auth',
        action: 'login',
        outcome: 'account_suspended',
        traceId,
        metadata: { email: this.redactEmail(normalizedEmail) },
      });
      throw new AppError(ErrorCode.FORBIDDEN, 'Account is suspended.');
    }

    const sessionInfo = await this.sessionService.createSession(account, userAgent, ipHash);

    await this.auditService.log({
      accountId: account.id,
      category: 'auth',
      action: 'login',
      outcome: 'success',
      traceId,
      metadata: { email: this.redactEmail(normalizedEmail) },
    });

    return {
      accessToken: this.createAccessToken(account, sessionInfo),
      refreshToken: sessionInfo.refreshToken,
      accountId: account.id,
      email: account.email,
      status: account.status as AccountStatus,
    };
  }

  async refresh(refreshToken: string, traceId?: string, userAgent?: string, ipHash?: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken, refreshToken: newRefreshToken } = await this.sessionService.rotateSession(refreshToken, userAgent, ipHash);

    await this.auditService.log({
      category: 'auth',
      action: 'refresh',
      outcome: 'success',
      traceId,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(sessionId: string, accountId: string, traceId?: string): Promise<void> {
    await this.sessionService.revokeSession(sessionId, accountId);

    await this.auditService.log({
      accountId,
      category: 'auth',
      action: 'logout',
      outcome: 'success',
      traceId,
    });
  }

  async forgotPassword(email: string, traceId?: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const rateLimitKey = `forgot:${this.hashIp(normalizedEmail)}`;
    const rateLimit = await this.rateLimitService.checkLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      await this.auditService.log({
        category: 'auth',
        action: 'forgot_password',
        outcome: 'rate_limited',
        traceId,
        metadata: { email: this.redactEmail(normalizedEmail) },
      });
      return;
    }

    const account = await this.prisma.account.findFirst({
      where: { emailNormalized: normalizedEmail, deletedAt: null },
    });

    if (!account) {
      await this.auditService.log({
        category: 'auth',
        action: 'forgot_password',
        outcome: 'account_not_found',
        traceId,
        metadata: { email: this.redactEmail(normalizedEmail) },
      });
      return;
    }

    const token = this.generateSecureToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + this.parseTtl(this.config.get('RESET_TOKEN_EXPIRY') as string));

    await this.prisma.passwordResetToken.create({
      data: {
        accountId: account.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.rateLimitService.resetLimit(rateLimitKey);

    await this.auditService.log({
      accountId: account.id,
      category: 'auth',
      action: 'forgot_password',
      outcome: 'success',
      traceId,
      metadata: { email: this.redactEmail(normalizedEmail) },
    });

    // In production, send email via worker
  }

  async resetPassword(token: string, newPassword: string, traceId?: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      await this.auditService.log({
        category: 'auth',
        action: 'reset_password',
        outcome: 'invalid_token',
        traceId,
      });
      if (resetToken) {
        throw new AppError(ErrorCode.AUTH_RESET_TOKEN_EXPIRED, 'Invalid or expired reset token.');
      }
      throw new AppError(ErrorCode.AUTH_INVALID_RESET_TOKEN, 'Invalid reset token.');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.account.update({
        where: { id: resetToken.accountId },
        data: { passwordHash, securityVersion: { increment: 1 } },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.session.updateMany({
        where: { accountId: resetToken.accountId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.auditService.log({
      accountId: resetToken.accountId,
      category: 'auth',
      action: 'reset_password',
      outcome: 'success',
      traceId,
    });
  }

  async deleteAccount(accountId: string, traceId?: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.session.updateMany({
        where: { accountId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.account.update({
        where: { id: accountId },
        data: { deletedAt: new Date() },
      }),
    ]);

    await this.auditService.log({
      accountId,
      category: 'account',
      action: 'delete',
      outcome: 'success',
      traceId,
    });
  }

  async upgradeGuest(accountId: string, email: string, password: string, traceId?: string): Promise<{ accessToken: string; refreshToken: string; accountId: string; email: string; status: AccountStatus }> {
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await this.prisma.account.findFirst({
      where: { emailNormalized: normalizedEmail, deletedAt: null },
    });

    if (existing && existing.id !== accountId) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const account = await this.prisma.account.update({
      where: { id: accountId },
      data: {
        email: normalizedEmail,
        emailNormalized: normalizedEmail,
        passwordHash,
        status: 'ACTIVE',
      },
    });

    await this.prisma.guestProfile.update({
      where: { accountId },
      data: { upgradedAt: new Date() },
    });

    const sessionInfo = await this.sessionService.createSession(account);

    await this.auditService.log({
      accountId,
      category: 'auth',
      action: 'guest_upgrade',
      outcome: 'success',
      traceId,
      metadata: { email: this.redactEmail(normalizedEmail) },
    });

    return {
      accessToken: this.createAccessToken(account, sessionInfo),
      refreshToken: sessionInfo.refreshToken,
      accountId: account.id,
      email: account.email,
      status: account.status as AccountStatus,
    };
  }

  private createAccessToken(account: { id: string; email: string; status: string; locale: string }, sessionInfo: { sessionId: string; familyId: string }): string {
    const payload: JwtPayload = {
      sub: account.id,
      email: account.email,
      status: account.status as JwtPayload['status'],
      locale: account.locale,
      sessionId: sessionInfo.sessionId,
      familyId: sessionInfo.familyId,
    };
    return this.jwtService.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET') as string,
      expiresIn: this.config.get('JWT_ACCESS_EXPIRY') as string,
    });
  }

  private generateSecureToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private hashIp(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  private redactEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}***` : '***';
    return `${maskedLocal}@${domain}`;
  }

  private parseTtl(ttl: string): number {
    const match = ttl.match(/^(\d+)([mhsd])$/);
    if (!match) return 60 * 60 * 1000;
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
