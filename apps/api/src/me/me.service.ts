import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../auth/audit.service';

@Injectable()
export class MeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getMe(accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, deletedAt: null },
      select: {
        id: true,
        email: true,
        status: true,
        locale: true,
        createdAt: true,
      },
    });

    if (!account) {
      return null;
    }

    return {
      id: account.id,
      email: account.email,
      status: account.status,
      locale: account.locale,
      createdAt: account.createdAt.toISOString(),
    };
  }
}
