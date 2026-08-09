import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionService } from './session.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config.service';
import { AppError, ErrorCode } from '@tlc/contracts';
import type { Account, Session } from '@prisma/client';

vi.mock('@nestjs/jwt', () => ({
  JwtService: class MockJwtService {
    verify(token: string) {
      if (token === 'valid-token') {
        return {
          sub: 'acc_1',
          email: 'test@example.com',
          status: 'ACTIVE',
          locale: 'en',
          sessionId: 'ses_1',
          familyId: 'fam_1',
        };
      }
      if (token === 'expired-token') {
        return {
          sub: 'acc_1',
          email: 'test@example.com',
          status: 'ACTIVE',
          locale: 'en',
          sessionId: 'ses_1',
          familyId: 'fam_1',
        };
      }
      throw new Error('Invalid token');
    }
    sign() {
      return 'mocked-access-token';
    }
  },
}));

const mockPrisma = {
  session: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  account: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
};

const mockConfig = {
  get: vi.fn((key: string) => {
    const defaults: Record<string, string | number> = {
      JWT_ACCESS_SECRET: 'test-secret',
      JWT_ACCESS_EXPIRY: '15m',
      SESSION_TTL_DAYS: 7,
    };
    return defaults[key] ?? '';
  }),
};

function createSessionService() {
  return new SessionService(
    mockPrisma as unknown as PrismaService,
    mockConfig as unknown as ConfigService,
  );
}

describe('SessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('creates a session with correct fields', async () => {
      const account: Account = {
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
      };

      mockPrisma.session.create.mockResolvedValue({
        id: 'ses_1',
        accountId: 'acc_1',
        tokenHash: 'hash',
        familyId: 'fam_1',
        createdAt: new Date(),
        expiresAt: new Date(),
        lastSeenAt: new Date(),
        userAgent: null,
        ipHash: null,
        revokedAt: null,
      } as Session);

      const result = await createSessionService().createSession(account, 'Mozilla/5.0', 'abc123');

      expect(result.sessionId).toBeDefined();
      expect(result.familyId).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.accessExpiresAt).toBeInstanceOf(Date);
      expect(result.refreshExpiresAt).toBeInstanceOf(Date);

      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: {
          accountId: 'acc_1',
          tokenHash: expect.any(String),
          familyId: result.familyId,
          expiresAt: expect.any(Date),
          lastSeenAt: expect.any(Date),
          userAgent: 'Mozilla/5.0',
          ipHash: 'abc123',
        },
      });
    });
  });

  describe('validateAccessToken', () => {
    it('returns account and session for valid token', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'ses_1',
        accountId: 'acc_1',
        tokenHash: 'hash',
        familyId: 'fam_1',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        lastSeenAt: new Date(),
        userAgent: null,
        ipHash: null,
        revokedAt: null,
      } as Session);

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

      mockPrisma.session.update.mockResolvedValue({
        id: 'ses_1',
        accountId: 'acc_1',
        tokenHash: 'hash',
        familyId: 'fam_1',
        createdAt: new Date(),
        expiresAt: new Date(),
        lastSeenAt: new Date(),
        userAgent: null,
        ipHash: null,
        revokedAt: null,
      } as Session);

      const result = await createSessionService().validateAccessToken('valid-token');

      expect(result.account.id).toBe('acc_1');
      expect(result.session.id).toBe('ses_1');
      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 'ses_1' },
        data: { lastSeenAt: expect.any(Date) },
      });
    });

    it('throws AUTH_INVALID_TOKEN for invalid JWT', async () => {
      await expect(createSessionService().validateAccessToken('invalid-token')).rejects.toThrow(
        new AppError(ErrorCode.AUTH_INVALID_TOKEN, 'Invalid access token'),
      );
    });

    it('throws AUTH_SESSION_NOT_FOUND when session does not exist', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);

      await expect(createSessionService().validateAccessToken('valid-token')).rejects.toThrow(
        new AppError(ErrorCode.AUTH_SESSION_NOT_FOUND, 'Session not found'),
      );
    });

    it('throws AUTH_SESSION_EXPIRED when session is expired', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'ses_1',
        accountId: 'acc_1',
        tokenHash: 'hash',
        familyId: 'fam_1',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - 3600000),
        lastSeenAt: new Date(),
        userAgent: null,
        ipHash: null,
        revokedAt: null,
      } as Session);

      await expect(createSessionService().validateAccessToken('expired-token')).rejects.toThrow(
        new AppError(ErrorCode.AUTH_SESSION_EXPIRED, 'Session expired'),
      );
    });

    it('throws AUTH_ACCOUNT_NOT_FOUND when account is deleted', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'ses_1',
        accountId: 'acc_1',
        tokenHash: 'hash',
        familyId: 'fam_1',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        lastSeenAt: new Date(),
        userAgent: null,
        ipHash: null,
        revokedAt: null,
      } as Session);

      mockPrisma.account.findFirst.mockResolvedValue(null);

      await expect(createSessionService().validateAccessToken('valid-token')).rejects.toThrow(
        new AppError(ErrorCode.AUTH_ACCOUNT_NOT_FOUND, 'Account not found'),
      );
    });
  });

  describe('rotateSession', () => {
    it('rotates session and returns new tokens', async () => {
      mockPrisma.session.findFirst.mockResolvedValue({
        id: 'ses_1',
        accountId: 'acc_1',
        tokenHash: 'old-hash',
        familyId: 'fam_1',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        lastSeenAt: new Date(),
        userAgent: null,
        ipHash: null,
        revokedAt: null,
      } as Session);

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

      mockPrisma.$transaction.mockResolvedValue(undefined);

      mockPrisma.session.create.mockResolvedValue({
        id: 'ses_2',
        accountId: 'acc_1',
        tokenHash: 'new-hash',
        familyId: 'fam_2',
        createdAt: new Date(),
        expiresAt: new Date(),
        lastSeenAt: new Date(),
        userAgent: null,
        ipHash: null,
        revokedAt: null,
      } as Session);

      const result = await createSessionService().rotateSession('old-refresh-token');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.session.update).toHaveBeenCalled();
      expect(mockPrisma.session.create).toHaveBeenCalled();
    });
  });

  describe('revokeSession', () => {
    it('revokes the specified session', async () => {
      mockPrisma.session.updateMany.mockResolvedValue({ count: 1 } as any);

      await createSessionService().revokeSession('ses_1', 'acc_1');

      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: { id: 'ses_1', accountId: 'acc_1' },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe('revokeAllSessions', () => {
    it('revokes all sessions for an account', async () => {
      mockPrisma.session.updateMany.mockResolvedValue({ count: 3 } as any);

      await createSessionService().revokeAllSessions('acc_1');

      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: { accountId: 'acc_1', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('excludes specified session from revocation', async () => {
      mockPrisma.session.updateMany.mockResolvedValue({ count: 2 } as any);

      await createSessionService().revokeAllSessions('acc_1', 'ses_1');

      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: { accountId: 'acc_1', id: { not: 'ses_1' }, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});
