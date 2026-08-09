import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveSlotService } from './save-slot.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config.service';
import { AppError, ErrorCode } from '@tlc/contracts';
import type { Account, SaveSlot as PrismaSaveSlot, SaveRevision as PrismaSaveRevision, SaveCheckpoint as PrismaSaveCheckpoint } from '@prisma/client';

vi.mock('crypto', () => ({
  createHash: () => ({
    update: () => ({
      digest: () => 'mocked-checksum',
    }),
  }),
}));

const mockPrisma = {
  saveSlot: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  saveRevision: {
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  saveCheckpoint: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

const mockConfig = {
  get: vi.fn((key: string) => {
    const defaults: Record<string, string | number> = {
      SAVE_SLOT_QUOTA: 10,
    };
    return defaults[key] ?? '';
  }),
};

function createSaveSlotService() {
  return new SaveSlotService(
    mockPrisma as unknown as PrismaService,
    mockConfig as unknown as ConfigService,
  );
}

describe('SaveSlotService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  describe('create', () => {
    it('creates a save slot with optional initial revision', async () => {
      mockPrisma.saveSlot.count.mockResolvedValue(0);
      mockPrisma.saveSlot.create.mockResolvedValue({
        id: 'slot_1',
        accountId: 'acc_1',
        name: 'Slot 1',
        status: 'ACTIVE',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      } as PrismaSaveSlot);
      mockPrisma.saveRevision.create.mockResolvedValue({
        id: 'rev_1',
        saveSlotId: 'slot_1',
        revision: 1,
        data: '{}',
        checksum: 'mocked-checksum',
        contentVersion: '0.1.0',
        createdAt: new Date(),
      } as PrismaSaveRevision);

      const result = await createSaveSlotService().create(account, { name: 'Slot 1', initialData: '{}' });

      expect(result.name).toBe('Slot 1');
      expect(result.status).toBe('ACTIVE');
      expect(mockPrisma.saveSlot.count).toHaveBeenCalledWith({ where: { accountId: 'acc_1', status: 'ACTIVE' } });
      expect(mockPrisma.saveRevision.create).toHaveBeenCalled();
    });

    it('throws SAVE_QUOTA_EXCEEDED when quota is reached', async () => {
      mockPrisma.saveSlot.count.mockResolvedValue(10);

      await expect(createSaveSlotService().create(account, { name: 'Slot 11' })).rejects.toThrow(
        new AppError(ErrorCode.SAVE_QUOTA_EXCEEDED, 'Save slot quota of 10 reached.'),
      );
    });
  });

  describe('list', () => {
    it('returns paginated save slots', async () => {
      mockPrisma.saveSlot.findMany.mockResolvedValue([
        {
          id: 'slot_1',
          accountId: 'acc_1',
          name: 'Slot 1',
          status: 'ACTIVE',
          contentVersion: '0.1.0',
          createdAt: new Date(),
          updatedAt: new Date(),
          archivedAt: null,
        } as PrismaSaveSlot,
      ]);
      mockPrisma.saveRevision.findFirst.mockResolvedValue({
        revision: 3,
      } as PrismaSaveRevision);

      const result = await createSaveSlotService().list(account, { limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].currentRevision).toBe(3);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('get', () => {
    it('returns a save slot by id', async () => {
      mockPrisma.saveSlot.findFirst.mockResolvedValue({
        id: 'slot_1',
        accountId: 'acc_1',
        name: 'Slot 1',
        status: 'ACTIVE',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      } as PrismaSaveSlot);
      mockPrisma.saveRevision.findFirst.mockResolvedValue({
        revision: 5,
      } as PrismaSaveRevision);

      const result = await createSaveSlotService().get(account, 'slot_1');

      expect(result.id).toBe('slot_1');
      expect(result.currentRevision).toBe(5);
    });

    it('throws SAVE_NOT_FOUND for non-existent slot', async () => {
      mockPrisma.saveSlot.findFirst.mockResolvedValue(null);

      await expect(createSaveSlotService().get(account, 'slot_1')).rejects.toThrow(
        new AppError(ErrorCode.SAVE_NOT_FOUND, 'Save slot not found.'),
      );
    });
  });

  describe('update', () => {
    it('updates save slot name and status', async () => {
      mockPrisma.saveSlot.findFirst.mockResolvedValue({
        id: 'slot_1',
        accountId: 'acc_1',
        name: 'Slot 1',
        status: 'ACTIVE',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      } as PrismaSaveSlot);
      mockPrisma.saveSlot.update.mockResolvedValue({
        id: 'slot_1',
        accountId: 'acc_1',
        name: 'Updated',
        status: 'ARCHIVED',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: new Date(),
      } as PrismaSaveSlot);
      mockPrisma.saveRevision.findFirst.mockResolvedValue({
        revision: 5,
      } as PrismaSaveRevision);

      const result = await createSaveSlotService().update(account, 'slot_1', { name: 'Updated', status: 'ARCHIVED' });

      expect(result.name).toBe('Updated');
      expect(result.status).toBe('ARCHIVED');
    });
  });

  describe('delete', () => {
    it('deletes a save slot', async () => {
      mockPrisma.saveSlot.findFirst.mockResolvedValue({
        id: 'slot_1',
        accountId: 'acc_1',
        name: 'Slot 1',
        status: 'ACTIVE',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      } as PrismaSaveSlot);
      mockPrisma.saveSlot.delete.mockResolvedValue({
        id: 'slot_1',
      } as PrismaSaveSlot);

      await createSaveSlotService().delete(account, 'slot_1');

      expect(mockPrisma.saveSlot.delete).toHaveBeenCalledWith({ where: { id: 'slot_1' } });
    });
  });

  describe('write', () => {
    it('creates a new revision with optimistic concurrency', async () => {
      mockPrisma.saveSlot.findFirst.mockResolvedValue({
        id: 'slot_1',
        accountId: 'acc_1',
        name: 'Slot 1',
        status: 'ACTIVE',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      } as PrismaSaveSlot);
      mockPrisma.saveRevision.findFirst.mockResolvedValue({
        revision: 2,
      } as PrismaSaveRevision);
      mockPrisma.saveRevision.create.mockResolvedValue({
        id: 'rev_3',
        saveSlotId: 'slot_1',
        revision: 3,
        data: '{"hp":100}',
        checksum: 'def456',
        contentVersion: '0.1.0',
        createdAt: new Date(),
      } as PrismaSaveRevision);
      mockPrisma.saveSlot.update.mockResolvedValue({
        id: 'slot_1',
      } as PrismaSaveSlot);

      const result = await createSaveSlotService().write(account, 'slot_1', { data: '{"hp":100}', expectedRevision: 2 });

      expect(result.revision).toBe(3);
      expect(result.checksum).toBe('mocked-checksum');
    });

    it('throws SAVE_CONFLICT on revision mismatch', async () => {
      mockPrisma.saveSlot.findFirst.mockResolvedValue({
        id: 'slot_1',
        accountId: 'acc_1',
        name: 'Slot 1',
        status: 'ACTIVE',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      } as PrismaSaveSlot);
      mockPrisma.saveRevision.findFirst.mockResolvedValue({
        revision: 2,
      } as PrismaSaveRevision);

      await expect(createSaveSlotService().write(account, 'slot_1', { data: '{}', expectedRevision: 1 })).rejects.toThrow(
        new AppError(ErrorCode.SAVE_CONFLICT, 'Expected revision 2, got 1.'),
      );
    });
  });

  describe('createCheckpoint', () => {
    it('creates a checkpoint at the latest revision', async () => {
      mockPrisma.saveSlot.findFirst.mockResolvedValue({
        id: 'slot_1',
        accountId: 'acc_1',
        name: 'Slot 1',
        status: 'ACTIVE',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
        revisions: [{ id: 'rev_3', saveSlotId: 'slot_1', revision: 3, data: '{}',           checksum: 'mocked-checksum', contentVersion: '0.1.0', createdAt: new Date() }],
      } as unknown as PrismaSaveSlot & { revisions: PrismaSaveRevision[] });
      mockPrisma.saveCheckpoint.create.mockResolvedValue({
        id: 'cp_1',
        saveSlotId: 'slot_1',
        revisionId: 'rev_3',
        label: 'Before boss',
        createdAt: new Date(),
      } as PrismaSaveCheckpoint);

      const result = await createSaveSlotService().createCheckpoint(account, 'slot_1', { label: 'Before boss' });

      expect(result.label).toBe('Before boss');
      expect(result.revisionId).toBe('rev_3');
    });
  });

  describe('listCheckpoints', () => {
    it('returns checkpoints for a slot', async () => {
      mockPrisma.saveSlot.findFirst.mockResolvedValue({
        id: 'slot_1',
        accountId: 'acc_1',
        name: 'Slot 1',
        status: 'ACTIVE',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      } as PrismaSaveSlot);
      mockPrisma.saveCheckpoint.findMany.mockResolvedValue([
        {
          id: 'cp_1',
          saveSlotId: 'slot_1',
          revisionId: 'rev_1',
          label: 'Start',
          createdAt: new Date(),
        } as PrismaSaveCheckpoint,
      ]);

      const result = await createSaveSlotService().listCheckpoints(account, 'slot_1');

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Start');
    });
  });

  describe('restore', () => {
    it('restores save slot to checkpoint revision', async () => {
      mockPrisma.saveSlot.findFirst.mockResolvedValue({
        id: 'slot_1',
        accountId: 'acc_1',
        name: 'Slot 1',
        status: 'ACTIVE',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      } as PrismaSaveSlot);
      mockPrisma.saveCheckpoint.findFirst.mockResolvedValue({
        id: 'cp_1',
        saveSlotId: 'slot_1',
        revisionId: 'rev_1',
        label: 'Start',
        createdAt: new Date(),
        revision: {
          id: 'rev_1',
          saveSlotId: 'slot_1',
          revision: 1,
          data: '{"hp":50}',
          checksum: 'old-checksum',
          contentVersion: '0.1.0',
          createdAt: new Date(),
        } as PrismaSaveRevision,
      } as PrismaSaveCheckpoint & { revision: PrismaSaveRevision });
      mockPrisma.saveRevision.findFirst.mockResolvedValue({
        revision: 2,
      } as PrismaSaveRevision);
      mockPrisma.saveRevision.create.mockResolvedValue({
        id: 'rev_3',
        saveSlotId: 'slot_1',
        revision: 3,
        data: '{"hp":50}',
        checksum: 'old-checksum',
        contentVersion: '0.1.0',
        createdAt: new Date(),
      } as PrismaSaveRevision);
      mockPrisma.saveSlot.update.mockResolvedValue({
        id: 'slot_1',
      } as PrismaSaveSlot);

      const result = await createSaveSlotService().restore(account, 'slot_1', 'cp_1');

      expect(result.revision).toBe(3);
      expect(result.checksum).toBe('old-checksum');
    });
  });

  describe('exportSave', () => {
    it('exports save slot with revisions and checkpoints', async () => {
      mockPrisma.saveSlot.findFirst.mockResolvedValue({
        id: 'slot_1',
        accountId: 'acc_1',
        name: 'Slot 1',
        status: 'ACTIVE',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
        revisions: [
          { id: 'rev_1', saveSlotId: 'slot_1', revision: 1, data: '{}', checksum: 'mocked-checksum', contentVersion: '0.1.0', createdAt: new Date(), checkpoints: [] },
        ],
      } as unknown as PrismaSaveSlot & { revisions: (PrismaSaveRevision & { checkpoints: PrismaSaveCheckpoint[] })[] });

      const result = await createSaveSlotService().exportSave(account, 'slot_1');

      expect(result.slot.id).toBe('slot_1');
      expect(result.revisions).toHaveLength(1);
      expect(result.checkpoints).toHaveLength(0);
    });
  });

  describe('importSave', () => {
    it('imports a save slot with revisions and checkpoints', async () => {
      mockPrisma.saveSlot.count.mockResolvedValue(0);
      mockPrisma.saveSlot.create.mockResolvedValue({
        id: 'slot_new',
        accountId: 'acc_1',
        name: 'Imported',
        status: 'ACTIVE',
        contentVersion: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      } as PrismaSaveSlot);
      mockPrisma.saveRevision.create.mockResolvedValue({
        id: 'rev_1',
        saveSlotId: 'slot_new',
        revision: 1,
        data: '{}',
          checksum: 'mocked-checksum',
        contentVersion: '0.1.0',
        createdAt: new Date(),
      } as PrismaSaveRevision);
      mockPrisma.saveCheckpoint.create.mockResolvedValue({
        id: 'cp_1',
        saveSlotId: 'slot_new',
        revisionId: 'rev_1',
        label: 'Start',
        createdAt: new Date(),
      } as PrismaSaveCheckpoint);

      const importData = {
        slot: { id: 'slot_old', name: 'Imported', status: 'ACTIVE', contentVersion: '0.1.0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archivedAt: null, currentRevision: 1 },
        revisions: [{ id: 'rev_1', saveSlotId: 'slot_old', revision: 1, data: '{}',           checksum: 'mocked-checksum', contentVersion: '0.1.0', createdAt: new Date().toISOString() }],
        checkpoints: [{ id: 'cp_1', saveSlotId: 'slot_old', revisionId: 'rev_1', label: 'Start', createdAt: new Date().toISOString() }],
      };

      const result = await createSaveSlotService().importSave(account, importData as Parameters<SaveSlotService['importSave']>[1]);

      expect(result.id).toBe('slot_new');
      expect(result.name).toBe('Imported');
    });
  });
});
