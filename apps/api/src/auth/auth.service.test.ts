import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config.service';
import { SessionService } from './session.service';
import { AuditService } from './audit.service';
import { RateLimitService } from './rate-limit.service';
import type { Account } from '@prisma/client';

vi.mock('bcrypt', () => ({
  hash: vi.fn(() => Promise.resolve('mocked-hash')),
  compare: vi.fn(() => Promise.resolve(false)),
}));

const mockPrisma = {
  account: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  session: {
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    findFirst: vi.fn(),
  },
  passwordResetToken: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  securityAuditEvent: {
    create: vi.fn(),
  },
  guestProfile: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

const mockJwtService = {
  sign: vi.fn(() => 'mock-access-token'),
};

const mockConfig = {
  get: vi.fn((key: string) => {
    const defaults: Record<string, string | number> = {
      JWT_ACCESS_SECRET: 'test-secret',
      JWT_ACCESS_EXPIRY: '15m',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      SESSION_TTL_DAYS: 7,
      RESET_TOKEN_EXPIRY: '1h',
      RATE_LIMIT_WINDOW_MS: 60000,
      RATE_LIMIT_MAX_ATTEMPTS: 5,
    };
    return defaults[key] ?? '';
  }),
};

const mockSessionService = {
  createSession: vi.fn(),
  validateAccessToken: vi.fn(),
  rotateSession: vi.fn(),
  revokeSession: vi.fn(),
  revokeAllSessions: vi.fn(),
};

const mockAuditService = {
  log: vi.fn(),
};

const mockRateLimitService = {
  checkLimit: vi.fn(),
  resetLimit: vi.fn(),
};

function createAuthService() {
  return new AuthService(
    mockPrisma as unknown as PrismaService,
    mockJwtService as unknown as JwtService,
    mockConfig as unknown as ConfigService,
    mockSessionService as unknown as SessionService,
    mockAuditService as unknown as AuditService,
    mockRateLimitService as unknown as RateLimitService,
  );
}

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('registers a new account successfully', async () => {
      mockRateLimitService.checkLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfterMs: 0 });
      mockPrisma.account.findFirst.mockResolvedValue(null);
      mockPrisma.account.create.mockResolvedValue({
        id: 'acc_1',
        email: 'test@example.com',
        emailNormalized: 'test@example.com',
        passwordHash: 'hash',
        status: 'ACTIVE',
        locale: 'en',
        securityVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as Account);
      mockSessionService.createSession.mockResolvedValue({
        sessionId: 'ses_1',
        familyId: 'fam_1',
        accessExpiresAt: new Date(),
        refreshExpiresAt: new Date(),
        refreshToken: 'refresh-token',
      });

      const result = await createAuthService().register('test@example.com', 'Password123');

      expect(result.accountId).toBe('acc_1');
      expect(result.email).toBe('test@example.com');
      expect(result.status).toBe('ACTIVE');
      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          emailNormalized: 'test@example.com',
          passwordHash: expect.any(String),
        },
      });
    });

    it('rejects duplicate email', async () => {
      mockRateLimitService.checkLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfterMs: 0 });
      mockPrisma.account.findFirst.mockResolvedValue({ id: 'acc_1' } as Account);

      await expect(createAuthService().register('test@example.com', 'Password123')).rejects.toThrow('An account with this email already exists.');
    });

    it('enforces rate limit on registration', async () => {
      mockRateLimitService.checkLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfterMs: 60000 });

      await expect(createAuthService().register('test@example.com', 'Password123')).rejects.toThrow('Too many registration attempts');
    });
  });

  describe('login', () => {
    it('logs in with valid credentials', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockRateLimitService.checkLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfterMs: 0 });
      mockPrisma.account.findFirst.mockResolvedValue({
        id: 'acc_1',
        email: 'test@example.com',
        emailNormalized: 'test@example.com',
        passwordHash: '$2b$12$hashedpassword',
        status: 'ACTIVE',
        locale: 'en',
        securityVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as Account);
      mockSessionService.createSession.mockResolvedValue({
        sessionId: 'ses_1',
        familyId: 'fam_1',
        accessExpiresAt: new Date(),
        refreshExpiresAt: new Date(),
        refreshToken: 'refresh-token',
      });

      const result = await createAuthService().login('test@example.com', 'Password123');

      expect(result.accountId).toBe('acc_1');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('rejects invalid credentials', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      mockRateLimitService.checkLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfterMs: 0 });
      mockPrisma.account.findFirst.mockResolvedValue(null);

      await expect(createAuthService().login('test@example.com', 'wrong')).rejects.toThrow('Invalid email or password.');
    });

    it('blocks suspended accounts', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockRateLimitService.checkLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfterMs: 0 });
      mockPrisma.account.findFirst.mockResolvedValue({
        id: 'acc_1',
        email: 'test@example.com',
        emailNormalized: 'test@example.com',
        passwordHash: 'hash',
        status: 'SUSPENDED',
        locale: 'en',
        securityVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as Account);

      await expect(createAuthService().login('test@example.com', 'Password123')).rejects.toThrow('Account is suspended.');
    });
  });

  describe('logout', () => {
    it('revokes the session', async () => {
      mockSessionService.revokeSession.mockResolvedValue(undefined);
      mockAuditService.log.mockResolvedValue(undefined);

      await createAuthService().logout('ses_1', 'acc_1', 'trace-1');

      expect(mockSessionService.revokeSession).toHaveBeenCalledWith('ses_1', 'acc_1');
    });
  });

  describe('refresh', () => {
    it('rotates session and returns new tokens', async () => {
      mockSessionService.rotateSession.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        session: { id: 'ses_2', accountId: 'acc_1', tokenHash: '', familyId: 'fam_2', createdAt: new Date(), expiresAt: new Date(), lastSeenAt: new Date(), userAgent: null, ipHash: null, revokedAt: null } as any,
      });

      const result = await createAuthService().refresh('old-refresh-token', 'trace-1');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });
  });

  describe('forgotPassword', () => {
    it('returns silently for unknown email', async () => {
      mockRateLimitService.checkLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfterMs: 0 });
      mockPrisma.account.findFirst.mockResolvedValue(null);

      await expect(createAuthService().forgotPassword('unknown@example.com')).resolves.toBeUndefined();
    });

    it('creates reset token for known email', async () => {
      mockRateLimitService.checkLimit.mockResolvedValue({ allowed: true, remaining: 4, retryAfterMs: 0 });
      mockPrisma.account.findFirst.mockResolvedValue({
        id: 'acc_1',
        email: 'test@example.com',
        emailNormalized: 'test@example.com',
        passwordHash: 'hash',
        status: 'ACTIVE',
        locale: 'en',
        securityVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as Account);
      mockPrisma.passwordResetToken.create.mockResolvedValue({
        id: 'reset_1',
        accountId: 'acc_1',
        tokenHash: 'hash',
        expiresAt: new Date(),
        usedAt: null,
        createdAt: new Date(),
      } as any);

      await expect(createAuthService().forgotPassword('test@example.com')).resolves.toBeUndefined();
      expect(mockPrisma.passwordResetToken.create).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('rejects invalid token', async () => {
      mockPrisma.passwordResetToken.findFirst.mockResolvedValue(null);

      await expect(createAuthService().resetPassword('invalid-token', 'NewPass123')).rejects.toThrow('Invalid reset token.');
    });

    it('rejects expired token', async () => {
      mockPrisma.passwordResetToken.findFirst.mockResolvedValue({
        id: 'reset_1',
        accountId: 'acc_1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
        createdAt: new Date(),
      } as any);

      await expect(createAuthService().resetPassword('token', 'NewPass123')).rejects.toThrow('Invalid or expired reset token.');
    });

    it('resets password with valid token', async () => {
      mockPrisma.passwordResetToken.findFirst.mockResolvedValue({
        id: 'reset_1',
        accountId: 'acc_1',
        tokenHash: 'hash',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
        createdAt: new Date(),
      } as any);
      mockPrisma.$transaction.mockResolvedValue(undefined);

      await expect(createAuthService().resetPassword('token', 'NewPass123')).resolves.toBeUndefined();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('soft deletes account and revokes sessions', async () => {
      mockPrisma.$transaction.mockResolvedValue(undefined);

      await expect(createAuthService().deleteAccount('acc_1', 'trace-1')).resolves.toBeUndefined();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('upgradeGuest', () => {
    it('upgrades guest to active account', async () => {
      mockPrisma.account.findFirst.mockResolvedValue(null);
      mockPrisma.account.update.mockResolvedValue({
        id: 'acc_1',
        email: 'new@example.com',
        emailNormalized: 'new@example.com',
        passwordHash: 'newhash',
        status: 'ACTIVE',
        locale: 'en',
        securityVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as Account);
      mockPrisma.guestProfile.update.mockResolvedValue({
        id: 'guest_1',
        accountId: 'acc_1',
        createdAt: new Date(),
        upgradedAt: new Date(),
      } as any);
      mockSessionService.createSession.mockResolvedValue({
        sessionId: 'ses_1',
        familyId: 'fam_1',
        accessExpiresAt: new Date(),
        refreshExpiresAt: new Date(),
        refreshToken: 'refresh-token',
      });

      const result = await createAuthService().upgradeGuest('acc_1', 'new@example.com', 'Password123');

      expect(result.accountId).toBe('acc_1');
      expect(result.status).toBe('ACTIVE');
    });
  });
});
