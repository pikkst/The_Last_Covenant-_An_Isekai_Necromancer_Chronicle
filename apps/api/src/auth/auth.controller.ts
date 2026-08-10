import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GuestUpgradeDto } from './dto/guest-upgrade.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RateLimitGuard)
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const result = await this.authService.register(dto.email, dto.password, traceId);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return new AuthResponseDto(result.accessToken, result.accountId, result.email, result.status);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const ipHash = this.hashIp(req.ip);
    const result = await this.authService.login(dto.email, dto.password, traceId, req.headers['user-agent'], ipHash);
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
  @UseGuards(RateLimitGuard)
  async refresh(@Body() dto: RefreshDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const ipHash = this.hashIp(req.ip);
    const result = await this.authService.refresh(dto.refreshToken, traceId, req.headers['user-agent'], ipHash);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    await this.authService.forgotPassword(dto.email, traceId);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    await this.authService.resetPassword(dto.token, dto.password, traceId);
  }

  @Post('guest/upgrade')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async upgradeGuest(@Body() dto: GuestUpgradeDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;
    const account = (req as Request & { session?: { accountId: string } }).session;
    if (!account) {
      throw new Error('No session');
    }
    const result = await this.authService.upgradeGuest(account.accountId, dto.email, dto.password, traceId);
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
    return crypto.createHash('sha256').update(ip).digest('hex');
  }
}
