import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config.service';
import { AppError, ErrorCode } from '@tlc/contracts';
import type { SaveSlot, SaveCheckpoint, CreateSaveSlotRequest, UpdateSaveSlotRequest, SaveSlotListParams, SaveSlotListResponse, WriteSaveRequest, CreateCheckpointRequest, SaveExport } from '@tlc/contracts';
import type { Account } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class SaveSlotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async create(account: Account, dto: CreateSaveSlotRequest): Promise<SaveSlot> {
    const quota = this.config.get('SAVE_SLOT_QUOTA') as number;
    const activeCount = await this.prisma.saveSlot.count({
      where: { accountId: account.id, status: 'ACTIVE' },
    });

    if (activeCount >= quota) {
      throw new AppError(ErrorCode.SAVE_QUOTA_EXCEEDED, `Save slot quota of ${quota} reached.`);
    }

    const slot = await this.prisma.saveSlot.create({
      data: {
        accountId: account.id,
        name: dto.name,
        status: 'ACTIVE',
      },
    });

    if (dto.initialData) {
      await this.writeRevision(slot.id, 1, dto.initialData, account.id);
    }

    return this.mapSlot(slot, 0);
  }

  async list(account: Account, params: SaveSlotListParams): Promise<SaveSlotListResponse> {
    const pageSize = Math.min(params.limit ?? 20, 100);
    const where: Record<string, unknown> = { accountId: account.id };

    if (params.status) {
      where.status = params.status;
    }

    const slots = await this.prisma.saveSlot.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: pageSize + 1,
      ...(params.cursor ? { cursor: { id: params.cursor } } : {}),
      skip: params.cursor ? 1 : 0,
    });

    const hasMore = slots.length > pageSize;
    const items = hasMore ? slots.slice(0, pageSize) : slots;

    const result = await Promise.all(
      items.map(async (slot) => {
        const lastRevision = await this.prisma.saveRevision.findFirst({
          where: { saveSlotId: slot.id },
          orderBy: { revision: 'desc' },
        });
        return this.mapSlot(slot, lastRevision?.revision ?? 0);
      }),
    );

    return {
      items: result,
      nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
      hasMore,
    };
  }

  async get(account: Account, saveId: string): Promise<SaveSlot> {
    const slot = await this.prisma.saveSlot.findFirst({
      where: { id: saveId, accountId: account.id },
    });

    if (!slot) {
      throw new AppError(ErrorCode.SAVE_NOT_FOUND, 'Save slot not found.');
    }

    const lastRevision = await this.prisma.saveRevision.findFirst({
      where: { saveSlotId: slot.id },
      orderBy: { revision: 'desc' },
    });

    return this.mapSlot(slot, lastRevision?.revision ?? 0);
  }

  async update(account: Account, saveId: string, dto: UpdateSaveSlotRequest): Promise<SaveSlot> {
    const slot = await this.prisma.saveSlot.findFirst({
      where: { id: saveId, accountId: account.id },
    });

    if (!slot) {
      throw new AppError(ErrorCode.SAVE_NOT_FOUND, 'Save slot not found.');
    }

    if (dto.status === 'ARCHIVED' && slot.status === 'ARCHIVED') {
      throw new AppError(ErrorCode.SAVE_INVALID_STATE, 'Save slot is already archived.');
    }

    const updated = await this.prisma.saveSlot.update({
      where: { id: saveId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.status !== undefined && { status: dto.status, archivedAt: dto.status === 'ARCHIVED' ? new Date() : null }),
      },
    });

    const lastRevision = await this.prisma.saveRevision.findFirst({
      where: { saveSlotId: updated.id },
      orderBy: { revision: 'desc' },
    });

    return this.mapSlot(updated, lastRevision?.revision ?? 0);
  }

  async delete(account: Account, saveId: string): Promise<void> {
    const slot = await this.prisma.saveSlot.findFirst({
      where: { id: saveId, accountId: account.id },
    });

    if (!slot) {
      throw new AppError(ErrorCode.SAVE_NOT_FOUND, 'Save slot not found.');
    }

    await this.prisma.saveSlot.delete({
      where: { id: saveId },
    });
  }

  async write(account: Account, saveId: string, dto: WriteSaveRequest): Promise<{ revision: number; checksum: string }> {
    const slot = await this.prisma.saveSlot.findFirst({
      where: { id: saveId, accountId: account.id, status: 'ACTIVE' },
    });

    if (!slot) {
      throw new AppError(ErrorCode.SAVE_NOT_FOUND, 'Save slot not found or archived.');
    }

    const lastRevision = await this.prisma.saveRevision.findFirst({
      where: { saveSlotId: saveId },
      orderBy: { revision: 'desc' },
    });

    const expectedRevision = lastRevision?.revision ?? 0;
    if (dto.expectedRevision !== expectedRevision) {
      throw new AppError(ErrorCode.SAVE_CONFLICT, `Expected revision ${expectedRevision}, got ${dto.expectedRevision}.`);
    }

    const nextRevision = expectedRevision + 1;
    const checksum = this.computeChecksum(dto.data);
    await this.writeRevision(saveId, nextRevision, dto.data, account.id, checksum);

    await this.prisma.saveSlot.update({
      where: { id: saveId },
      data: { updatedAt: new Date() },
    });

    return { revision: nextRevision, checksum };
  }

  async createCheckpoint(account: Account, saveId: string, dto: CreateCheckpointRequest): Promise<SaveCheckpoint> {
    const slot = await this.prisma.saveSlot.findFirst({
      where: { id: saveId, accountId: account.id, status: 'ACTIVE' },
      include: { revisions: { orderBy: { revision: 'desc' }, take: 1 } },
    });

    if (!slot || slot.revisions.length === 0) {
      throw new AppError(ErrorCode.SAVE_NOT_FOUND, 'Save slot not found or has no revisions.');
    }

    const lastRevision = slot.revisions[0];
    const checkpoint = await this.prisma.saveCheckpoint.create({
      data: {
        saveSlotId: saveId,
        revisionId: lastRevision.id,
        label: dto.label,
      },
    });

    return {
      id: checkpoint.id,
      saveSlotId: checkpoint.saveSlotId,
      revisionId: checkpoint.revisionId,
      label: checkpoint.label,
      createdAt: checkpoint.createdAt.toISOString(),
    };
  }

  async listCheckpoints(account: Account, saveId: string): Promise<SaveCheckpoint[]> {
    const slot = await this.prisma.saveSlot.findFirst({
      where: { id: saveId, accountId: account.id },
    });

    if (!slot) {
      throw new AppError(ErrorCode.SAVE_NOT_FOUND, 'Save slot not found.');
    }

    const checkpoints = await this.prisma.saveCheckpoint.findMany({
      where: { saveSlotId: saveId },
      orderBy: { createdAt: 'desc' },
    });

    return checkpoints.map((cp) => ({
      id: cp.id,
      saveSlotId: cp.saveSlotId,
      revisionId: cp.revisionId,
      label: cp.label,
      createdAt: cp.createdAt.toISOString(),
    }));
  }

  async restore(account: Account, saveId: string, checkpointId: string): Promise<{ revision: number; checksum: string }> {
    const slot = await this.prisma.saveSlot.findFirst({
      where: { id: saveId, accountId: account.id, status: 'ACTIVE' },
    });

    if (!slot) {
      throw new AppError(ErrorCode.SAVE_NOT_FOUND, 'Save slot not found or archived.');
    }

    const checkpoint = await this.prisma.saveCheckpoint.findFirst({
      where: { id: checkpointId, saveSlotId: saveId },
      include: { revision: true },
    });

    if (!checkpoint) {
      throw new AppError(ErrorCode.SAVE_NOT_FOUND, 'Checkpoint not found.');
    }

    const lastRevision = await this.prisma.saveRevision.findFirst({
      where: { saveSlotId: saveId },
      orderBy: { revision: 'desc' },
    });

    const expectedRevision = lastRevision?.revision ?? 0;
    const nextRevision = expectedRevision + 1;

    await this.writeRevision(saveId, nextRevision, checkpoint.revision.data, account.id, checkpoint.revision.checksum);

    await this.prisma.saveSlot.update({
      where: { id: saveId },
      data: { updatedAt: new Date() },
    });

    return { revision: nextRevision, checksum: checkpoint.revision.checksum };
  }

  async exportSave(account: Account, saveId: string): Promise<SaveExport> {
    const slot = await this.prisma.saveSlot.findFirst({
      where: { id: saveId, accountId: account.id },
      include: { revisions: { include: { checkpoints: true } } },
    });

    if (!slot) {
      throw new AppError(ErrorCode.SAVE_NOT_FOUND, 'Save slot not found.');
    }

    const revisions = slot.revisions.map((r) => ({
      id: r.id,
      saveSlotId: r.saveSlotId,
      revision: r.revision,
      data: r.data,
      checksum: r.checksum,
      contentVersion: r.contentVersion,
      createdAt: r.createdAt.toISOString(),
    }));

    const checkpoints = slot.revisions.flatMap((r) =>
      r.checkpoints.map((cp) => ({
        id: cp.id,
        saveSlotId: cp.saveSlotId,
        revisionId: cp.revisionId,
        label: cp.label,
        createdAt: cp.createdAt.toISOString(),
      })),
    );

    return {
      slot: this.mapSlot(slot, revisions[revisions.length - 1]?.revision ?? 0),
      revisions,
      checkpoints,
    };
  }

  async importSave(account: Account, data: SaveExport): Promise<SaveSlot> {
    const quota = this.config.get('SAVE_SLOT_QUOTA') as number;
    const activeCount = await this.prisma.saveSlot.count({
      where: { accountId: account.id, status: 'ACTIVE' },
    });

    if (activeCount >= quota) {
      throw new AppError(ErrorCode.SAVE_QUOTA_EXCEEDED, `Save slot quota of ${quota} reached.`);
    }

    const slot = await this.prisma.saveSlot.create({
      data: {
        accountId: account.id,
        name: data.slot.name,
        status: data.slot.status,
        contentVersion: data.slot.contentVersion,
      },
    });

    for (const rev of data.revisions) {
      await this.prisma.saveRevision.create({
        data: {
          saveSlotId: slot.id,
          revision: rev.revision,
          data: rev.data,
          checksum: rev.checksum,
          contentVersion: rev.contentVersion,
        },
      });
    }

    for (const cp of data.checkpoints) {
      await this.prisma.saveCheckpoint.create({
        data: {
          saveSlotId: slot.id,
          revisionId: cp.revisionId,
          label: cp.label,
        },
      });
    }

    return this.mapSlot(slot, data.revisions[data.revisions.length - 1]?.revision ?? 0);
  }

  private async writeRevision(saveSlotId: string, revision: number, data: string, accountId: string, checksum?: string): Promise<unknown> {
    const computedChecksum = checksum ?? this.computeChecksum(data);
    return this.prisma.saveRevision.create({
      data: {
        saveSlotId,
        revision,
        data,
        checksum: computedChecksum,
        contentVersion: '0.1.0',
      },
    });
  }

  private computeChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private mapSlot(slot: { id: string; accountId: string; name: string; status: string; contentVersion: string; createdAt: Date; updatedAt: Date; archivedAt: Date | null }, currentRevision: number): SaveSlot {
    return {
      id: slot.id,
      accountId: slot.accountId,
      name: slot.name,
      status: slot.status as SaveSlot['status'],
      contentVersion: slot.contentVersion,
      createdAt: slot.createdAt.toISOString(),
      updatedAt: slot.updatedAt.toISOString(),
      archivedAt: slot.archivedAt?.toISOString() ?? null,
      currentRevision,
    };
  }
}
