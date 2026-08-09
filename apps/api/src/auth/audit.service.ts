import { Injectable, Scope } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AuditEvent {
  accountId?: string;
  category: string;
  action: string;
  outcome: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable({ scope: Scope.REQUEST })
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(event: AuditEvent): Promise<void> {
    try {
      await this.prisma.securityAuditEvent.create({
        data: {
          accountId: event.accountId,
          category: event.category,
          action: event.action,
          outcome: event.outcome,
          traceId: event.traceId,
          metadata: event.metadata ? JSON.parse(JSON.stringify(event.metadata)) : undefined,
        },
      });
    } catch {
      // Audit must not break the request flow
    }
  }
}
