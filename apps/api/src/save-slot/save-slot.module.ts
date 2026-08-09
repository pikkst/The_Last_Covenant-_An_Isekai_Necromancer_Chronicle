import { Module } from '@nestjs/common';
import { SaveSlotController } from './save-slot.controller';
import { SaveSlotService } from './save-slot.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '../config.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [SaveSlotController],
  providers: [SaveSlotService, JwtAuthGuard],
  exports: [SaveSlotService],
})
export class SaveSlotModule {}
