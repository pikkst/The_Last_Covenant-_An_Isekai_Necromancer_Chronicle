import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Req, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { SaveSlotService } from './save-slot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSaveSlotDto } from './dto/create-save-slot.dto';
import { UpdateSaveSlotDto } from './dto/update-save-slot.dto';
import { WriteSaveDto } from './dto/write-save.dto';
import { CreateCheckpointDto } from './dto/create-checkpoint.dto';
import type { Account } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: Account;
}

@Controller('saves')
export class SaveSlotController {
  constructor(private readonly saveSlotService: SaveSlotService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateSaveSlotDto) {
    const account = req.user!;
    return this.saveSlotService.create(account, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Req() req: AuthenticatedRequest, @Query() query: Record<string, string | undefined>) {
    const account = req.user!;
    const params = {
      cursor: query.cursor ?? undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      status: query.status as 'ACTIVE' | 'ARCHIVED' | undefined,
    };
    return this.saveSlotService.list(account, params);
  }

  @Get(':saveId')
  @UseGuards(JwtAuthGuard)
  async get(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string) {
    const account = req.user!;
    return this.saveSlotService.get(account, saveId);
  }

  @Patch(':saveId')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string, @Body() dto: UpdateSaveSlotDto) {
    const account = req.user!;
    return this.saveSlotService.update(account, saveId, dto);
  }

  @Delete(':saveId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string) {
    const account = req.user!;
    await this.saveSlotService.delete(account, saveId);
  }

  @Post(':saveId/write')
  @UseGuards(JwtAuthGuard)
  async write(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string, @Body() dto: WriteSaveDto) {
    const account = req.user!;
    return this.saveSlotService.write(account, saveId, dto);
  }

  @Post(':saveId/checkpoints')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCheckpoint(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string, @Body() dto: CreateCheckpointDto) {
    const account = req.user!;
    return this.saveSlotService.createCheckpoint(account, saveId, dto);
  }

  @Get(':saveId/checkpoints')
  @UseGuards(JwtAuthGuard)
  async listCheckpoints(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string) {
    const account = req.user!;
    return this.saveSlotService.listCheckpoints(account, saveId);
  }

  @Post(':saveId/restore')
  @UseGuards(JwtAuthGuard)
  async restore(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string, @Body() body: { checkpointId: string }) {
    const account = req.user!;
    return this.saveSlotService.restore(account, saveId, body.checkpointId);
  }

  @Get(':saveId/export')
  @UseGuards(JwtAuthGuard)
  async exportSave(@Req() req: AuthenticatedRequest, @Param('saveId') saveId: string) {
    const account = req.user!;
    return this.saveSlotService.exportSave(account, saveId);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async importSave(@Req() req: AuthenticatedRequest, @Body() data: { slot: unknown; revisions: unknown[]; checkpoints: unknown[] }) {
    const account = req.user!;
    return this.saveSlotService.importSave(account, data as Parameters<SaveSlotService['importSave']>[1]);
  }
}
