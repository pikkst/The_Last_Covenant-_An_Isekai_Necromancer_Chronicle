import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export class PrismaService extends PrismaClient {}

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
