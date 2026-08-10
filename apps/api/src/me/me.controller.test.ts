import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Controller, UseGuards, Get, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import type { Account } from '@prisma/client';

class MockJwtAuthGuard {
  async canActivate() {
    return true;
  }
}

class MockOptionalAuthGuard {
  async canActivate() {
    return true;
  }
}

interface AuthenticatedRequest extends Request {
  user?: Account;
  session?: { id: string; accountId: string };
}

@Controller('me')
class TestMeController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(MockOptionalAuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    const account = req.user;
    if (!account) {
      return { authenticated: false };
    }
    return {
      id: account.id,
      email: account.email,
      status: account.status,
      locale: account.locale,
      createdAt: account.createdAt.toISOString(),
    };
  }

  @Delete()
  @UseGuards(MockJwtAuthGuard)
  async delete(@Req() req: AuthenticatedRequest) {
    const account = req.user!;
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;

    await this.authService.deleteAccount(account.id, traceId);

    return { deletedAt: new Date().toISOString() };
  }
}

describe('me controller', () => {
  let mockAuthService: {
    deleteAccount: ReturnType<typeof vi.fn>;
  };
  let controller: TestMeController;

  beforeEach(() => {
    mockAuthService = {
      deleteAccount: vi.fn(),
    };
    controller = new TestMeController(mockAuthService);
  });

  it('returns unauthenticated when no user', () => {
    const req = {} as AuthenticatedRequest;
    const result = controller.me(req);
    expect(result).toEqual({ authenticated: false });
  });

  it('returns account data when user is present', () => {
    const account: Account = {
      id: 'acc_1',
      email: 'test@example.com',
      emailNormalized: 'test@example.com',
      passwordHash: 'hash',
      status: 'ACTIVE',
      locale: 'en',
      securityVersion: 0,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
    };
    const req = { user: account } as AuthenticatedRequest;
    const result = controller.me(req);
    expect(result).toEqual({
      id: 'acc_1',
      email: 'test@example.com',
      status: 'ACTIVE',
      locale: 'en',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });

  it('delete calls authService.deleteAccount', async () => {
    mockAuthService.deleteAccount.mockResolvedValue(undefined);

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
    const req = { user: account } as AuthenticatedRequest;

    const result = await controller.delete(req);

    expect(mockAuthService.deleteAccount).toHaveBeenCalledWith('acc_1', undefined);
    expect(result).toHaveProperty('deletedAt');
  });
});
