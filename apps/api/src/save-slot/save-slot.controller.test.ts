import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Controller, UseGuards, Get, Post, Patch, Delete, Req, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { SaveSlotService } from './save-slot.service';
import type { Account } from '@prisma/client';

class MockJwtAuthGuard {
  async canActivate() {
    return true;
  }
}

interface AuthenticatedRequest extends Request {
  user?: Account;
}

@Controller('saves')
class TestSaveSlotController {
  constructor(private readonly saveSlotService: SaveSlotService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(MockJwtAuthGuard)
  async create(@Req() req: AuthenticatedRequest, @Body() dto: { name: string; initialData?: string }) {
    return this.saveSlotService.create(req.user!, dto);
  }

  @Get()
  @UseGuards(MockJwtAuthGuard)
  async list(@Req() req: AuthenticatedRequest, @Query() query: Record<string, string | undefined>) {
    return this.saveSlotService.list(req.user!, {
      cursor: query.cursor ?? undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      status: query.status as 'ACTIVE' | 'ARCHIVED' | undefined,
    });
  }

  @Get(':saveId')
  @UseGuards(MockJwtAuthGuard)
  async get(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string) {
    return this.saveSlotService.get(req.user!, saveId);
  }

  @Patch(':saveId')
  @UseGuards(MockJwtAuthGuard)
  async update(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string, @Body() dto: { name?: string; status?: string }) {
    return this.saveSlotService.update(req.user!, saveId, dto);
  }

  @Delete(':saveId')
  @UseGuards(MockJwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string) {
    await this.saveSlotService.delete(req.user!, saveId);
  }

  @Post(':saveId/write')
  @UseGuards(MockJwtAuthGuard)
  async write(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string, @Body() dto: { data: string; expectedRevision: number }) {
    return this.saveSlotService.write(req.user!, saveId, dto);
  }

  @Post(':saveId/checkpoints')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(MockJwtAuthGuard)
  async createCheckpoint(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string, @Body() dto: { label?: string }) {
    return this.saveSlotService.createCheckpoint(req.user!, saveId, dto);
  }

  @Get(':saveId/checkpoints')
  @UseGuards(MockJwtAuthGuard)
  async listCheckpoints(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string) {
    return this.saveSlotService.listCheckpoints(req.user!, saveId);
  }

  @Post(':saveId/restore')
  @UseGuards(MockJwtAuthGuard)
  async restore(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string, @Body() body: { checkpointId: string }) {
    return this.saveSlotService.restore(req.user!, saveId, body.checkpointId);
  }

  @Get(':saveId/export')
  @UseGuards(MockJwtAuthGuard)
  async exportSave(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string) {
    return this.saveSlotService.exportSave(req.user!, saveId);
  }

  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(MockJwtAuthGuard)
  async importSave(@Req() req: AuthenticatedRequest, @Body() data: { slot: unknown; revisions: unknown[]; checkpoints: unknown[] }) {
    return this.saveSlotService.importSave(req.user!, data as Parameters<SaveSlotService['importSave']>[1]);
  }
}

describe('save-slot controller', () => {
  let mockSaveSlotService: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    write: ReturnType<typeof vi.fn>;
    createCheckpoint: ReturnType<typeof vi.fn>;
    listCheckpoints: ReturnType<typeof vi.fn>;
    restore: ReturnType<typeof vi.fn>;
    exportSave: ReturnType<typeof vi.fn>;
    importSave: ReturnType<typeof vi.fn>;
  };
  let controller: TestSaveSlotController;

  beforeEach(() => {
    mockSaveSlotService = {
      create: vi.fn(),
      list: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      write: vi.fn(),
      createCheckpoint: vi.fn(),
      listCheckpoints: vi.fn(),
      restore: vi.fn(),
      exportSave: vi.fn(),
      importSave: vi.fn(),
    };
    controller = new TestSaveSlotController(mockSaveSlotService);
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

  it('create delegates to service', async () => {
    mockSaveSlotService.create.mockResolvedValue({ id: 'slot_1', name: 'Slot 1' });

    const result = await controller.create({ user: account } as AuthenticatedRequest, { name: 'Slot 1' });

    expect(mockSaveSlotService.create).toHaveBeenCalledWith(account, { name: 'Slot 1' });
    expect(result.id).toBe('slot_1');
  });

  it('list delegates to service', async () => {
    mockSaveSlotService.list.mockResolvedValue({ items: [], hasMore: false });

    const result = await controller.list({ user: account } as AuthenticatedRequest, {});

    expect(mockSaveSlotService.list).toHaveBeenCalled();
    expect(result).toEqual({ items: [], hasMore: false });
  });

  it('get delegates to service', async () => {
    mockSaveSlotService.get.mockResolvedValue({ id: 'slot_1', name: 'Slot 1' });

    const result = await controller.get({ user: account } as AuthenticatedRequest, 'slot_1');

    expect(mockSaveSlotService.get).toHaveBeenCalledWith(account, 'slot_1');
    expect(result.id).toBe('slot_1');
  });

  it('update delegates to service', async () => {
    mockSaveSlotService.update.mockResolvedValue({ id: 'slot_1', name: 'Updated' });

    const result = await controller.update({ user: account } as AuthenticatedRequest, 'slot_1', { name: 'Updated' });

    expect(mockSaveSlotService.update).toHaveBeenCalledWith(account, 'slot_1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('delete delegates to service', async () => {
    mockSaveSlotService.delete.mockResolvedValue(undefined);

    await controller.delete({ user: account } as AuthenticatedRequest, 'slot_1');

    expect(mockSaveSlotService.delete).toHaveBeenCalledWith(account, 'slot_1');
  });

  it('write delegates to service', async () => {
    mockSaveSlotService.write.mockResolvedValue({ revision: 3, checksum: 'abc' });

    const result = await controller.write({ user: account } as AuthenticatedRequest, 'slot_1', { data: '{}', expectedRevision: 2 });

    expect(mockSaveSlotService.write).toHaveBeenCalledWith(account, 'slot_1', { data: '{}', expectedRevision: 2 });
    expect(result.revision).toBe(3);
  });

  it('createCheckpoint delegates to service', async () => {
    mockSaveSlotService.createCheckpoint.mockResolvedValue({ id: 'cp_1', label: 'Start' });

    const result = await controller.createCheckpoint({ user: account } as AuthenticatedRequest, 'slot_1', { label: 'Start' });

    expect(mockSaveSlotService.createCheckpoint).toHaveBeenCalledWith(account, 'slot_1', { label: 'Start' });
    expect(result.label).toBe('Start');
  });

  it('listCheckpoints delegates to service', async () => {
    mockSaveSlotService.listCheckpoints.mockResolvedValue([{ id: 'cp_1' }]);

    const result = await controller.listCheckpoints({ user: account } as AuthenticatedRequest, 'slot_1');

    expect(mockSaveSlotService.listCheckpoints).toHaveBeenCalledWith(account, 'slot_1');
    expect(result).toEqual([{ id: 'cp_1' }]);
  });

  it('restore delegates to service', async () => {
    mockSaveSlotService.restore.mockResolvedValue({ revision: 3, checksum: 'abc' });

    const result = await controller.restore({ user: account } as AuthenticatedRequest, 'slot_1', { checkpointId: 'cp_1' });

    expect(mockSaveSlotService.restore).toHaveBeenCalledWith(account, 'slot_1', 'cp_1');
    expect(result.revision).toBe(3);
  });

  it('exportSave delegates to service', async () => {
    mockSaveSlotService.exportSave.mockResolvedValue({ slot: { id: 'slot_1' }, revisions: [], checkpoints: [] });

    const result = await controller.exportSave({ user: account } as AuthenticatedRequest, 'slot_1');

    expect(mockSaveSlotService.exportSave).toHaveBeenCalledWith(account, 'slot_1');
    expect(result.slot.id).toBe('slot_1');
  });

  it('importSave delegates to service', async () => {
    mockSaveSlotService.importSave.mockResolvedValue({ id: 'slot_new', name: 'Imported' });

    const result = await controller.importSave({ user: account } as AuthenticatedRequest, { slot: {}, revisions: [], checkpoints: [] });

    expect(mockSaveSlotService.importSave).toHaveBeenCalled();
    expect(result.id).toBe('slot_new');
  });
});
