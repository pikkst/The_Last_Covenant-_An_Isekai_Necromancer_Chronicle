import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Controller, UseGuards, Post, Body, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AppError, ErrorCode } from '@tlc/contracts';
import { AuthResponseDto } from './dto/auth-response.dto';
import type { AccountStatus } from '@tlc/contracts';

class MockRateLimitGuard {
  async canActivate() {
    return true;
  }
}

@Controller('auth')
class TestAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(MockRateLimitGuard)
  async register(@Body() dto: { email?: string; password?: string }, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const result = await this.authService.register(dto.email!, dto.password!, traceId);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return new AuthResponseDto(result.accessToken, result.accountId, result.email, result.status);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(MockRateLimitGuard)
  async login(@Body() dto: { email?: string; password?: string }, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const ipHash = this.hashIp(req.ip);
    const result = await this.authService.login(dto.email!, dto.password!, traceId, req.headers['user-agent'], ipHash);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return new AuthResponseDto(result.accessToken, result.accountId, result.email, result.status);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const session = (req as Request & { session?: { id: string; accountId: string } }).session;
    if (session) {
      await this.authService.logout(session.id, session.accountId, traceId);
    }
    this.clearAuthCookies(res);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(MockRateLimitGuard)
  async refresh(@Body() dto: { refreshToken?: string }, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const ipHash = this.hashIp(req.ip);
    const result = await this.authService.refresh(dto.refreshToken!, traceId, req.headers['user-agent'], ipHash);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(MockRateLimitGuard)
  async forgotPassword(@Body() dto: { email?: string }, @Req() req: Request) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    await this.authService.forgotPassword(dto.email!, traceId);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(MockRateLimitGuard)
  async resetPassword(@Body() dto: { token?: string; password?: string }, @Req() req: Request) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    await this.authService.resetPassword(dto.token!, dto.password!, traceId);
  }

  @Post('guest/upgrade')
  @HttpCode(HttpStatus.OK)
  @UseGuards(MockRateLimitGuard)
  async upgradeGuest(@Body() dto: { email?: string; password?: string }, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const account = (req as Request & { session?: { accountId: string } }).session;
    if (!account) {
      throw new Error('No session');
    }
    const result = await this.authService.upgradeGuest(account.accountId, dto.email!, dto.password!, traceId);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return new AuthResponseDto(result.accessToken, result.accountId, result.email, result.status);
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.cookie('accessToken', '', { httpOnly: true, expires: new Date(0), path: '/' });
    res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0), path: '/' });
  }

  private hashIp(ip?: string): string {
    if (!ip) return 'unknown';
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);
    return Array.from(new Uint8Array(data)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}

describe('auth controller', () => {
  let mockAuthService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
    forgotPassword: ReturnType<typeof vi.fn>;
    resetPassword: ReturnType<typeof vi.fn>;
    deleteAccount: ReturnType<typeof vi.fn>;
    upgradeGuest: ReturnType<typeof vi.fn>;
  };
  let controller: TestAuthController;

  beforeEach(() => {
    mockAuthService = {
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      deleteAccount: vi.fn(),
      upgradeGuest: vi.fn(),
    };
    controller = new TestAuthController(mockAuthService);
  });

  it('register returns AuthResponseDto on success', async () => {
    mockAuthService.register.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      accountId: 'acc_1',
      email: 'newuser@example.com',
      status: 'ACTIVE' as AccountStatus,
    });

    const res = { cookie: vi.fn() } as unknown as Response;
    const req = {} as Request;

    const result = await controller.register({ email: 'newuser@example.com', password: 'Password123' }, req, res);

    expect(result).toBeInstanceOf(AuthResponseDto);
    expect(result.accessToken).toBe('access-token');
    expect(result.email).toBe('newuser@example.com');
    expect(result.status).toBe('ACTIVE');
    expect(mockAuthService.register).toHaveBeenCalledWith('newuser@example.com', 'Password123', undefined);
  });

  it('login returns AuthResponseDto on success', async () => {
    mockAuthService.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      accountId: 'acc_1',
      email: 'test@example.com',
      status: 'ACTIVE' as AccountStatus,
    });

    const res = { cookie: vi.fn() } as unknown as Response;
    const req = { ip: '127.0.0.1', headers: {} } as Request;

    const result = await controller.login({ email: 'test@example.com', password: 'Password123' }, req, res);

    expect(result).toBeInstanceOf(AuthResponseDto);
    expect(result.accessToken).toBe('access-token');
    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'Password123', undefined, undefined, expect.any(String));
  });

  it('logout calls authService.logout when session exists', async () => {
    mockAuthService.logout.mockResolvedValue(undefined);

    const res = { cookie: vi.fn() } as unknown as Response;
    const req = { session: { id: 'ses_1', accountId: 'acc_1' } } as Request;

    await controller.logout(req, res);

    expect(mockAuthService.logout).toHaveBeenCalledWith('ses_1', 'acc_1', undefined);
  });

  it('logout does not call authService when no session', async () => {
    const res = { cookie: vi.fn() } as unknown as Response;
    const req = {} as Request;

    await controller.logout(req, res);

    expect(mockAuthService.logout).not.toHaveBeenCalled();
  });

  it('refresh returns new access token', async () => {
    mockAuthService.refresh.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const res = { cookie: vi.fn() } as unknown as Response;
    const req = { ip: '127.0.0.1', headers: {} } as Request;

    const result = await controller.refresh({ refreshToken: 'old-refresh-token' }, req, res);

    expect(result).toEqual({ accessToken: 'new-access-token' });
    expect(mockAuthService.refresh).toHaveBeenCalledWith('old-refresh-token', undefined, undefined, expect.any(String));
  });

  it('forgotPassword calls authService', async () => {
    mockAuthService.forgotPassword.mockResolvedValue(undefined);

    const req = {} as Request;

    await controller.forgotPassword({ email: 'test@example.com' }, req);

    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com', undefined);
  });

  it('resetPassword calls authService', async () => {
    mockAuthService.resetPassword.mockResolvedValue(undefined);

    const req = {} as Request;

    await controller.resetPassword({ token: 'valid-token', password: 'NewPass123' }, req);

    expect(mockAuthService.resetPassword).toHaveBeenCalledWith('valid-token', 'NewPass123', undefined);
  });

  it('login rejects with AppError on invalid credentials', async () => {
    mockAuthService.login.mockRejectedValue(new AppError(ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password.'));

    const res = { cookie: vi.fn() } as unknown as Response;
    const req = { ip: '127.0.0.1', headers: {} } as Request;

    await expect(controller.login({ email: 'bad@example.com', password: 'wrong' }, req, res)).rejects.toThrow('Invalid email or password.');
  });

  it('resetPassword rejects with AppError on invalid token', async () => {
    mockAuthService.resetPassword.mockRejectedValue(new AppError(ErrorCode.AUTH_INVALID_RESET_TOKEN, 'Invalid reset token.'));

    const req = {} as Request;

    await expect(controller.resetPassword({ token: 'invalid', password: 'NewPass123' }, req)).rejects.toThrow('Invalid reset token.');
  });

  it('upgradeGuest returns AuthResponseDto on success', async () => {
    mockAuthService.upgradeGuest.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      accountId: 'acc_1',
      email: 'newuser@example.com',
      status: 'ACTIVE' as AccountStatus,
    });

    const res = { cookie: vi.fn() } as unknown as Response;
    const req = { session: { accountId: 'acc_1' } } as Request;

    const result = await controller.upgradeGuest({ email: 'newuser@example.com', password: 'Password123' }, req, res);

    expect(result).toBeInstanceOf(AuthResponseDto);
    expect(result.accessToken).toBe('access-token');
    expect(result.email).toBe('newuser@example.com');
    expect(mockAuthService.upgradeGuest).toHaveBeenCalledWith('acc_1', 'newuser@example.com', 'Password123', undefined);
  });
});
