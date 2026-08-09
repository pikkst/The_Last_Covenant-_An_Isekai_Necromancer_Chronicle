import { Controller, Get, Delete, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { AuthService } from '../auth/auth.service';
import type { Account } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: Account;
  session?: { id: string; accountId: string };
}

@Controller('me')
export class MeController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: AuthenticatedRequest) {
    const account = req.user!;
    const traceId = (req as Request & { traceContext?: { traceId?: string } }).traceContext?.traceId;

    await this.authService.deleteAccount(account.id, traceId);

    return { deletedAt: new Date().toISOString() };
  }
}
