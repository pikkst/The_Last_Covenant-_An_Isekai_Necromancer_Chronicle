import { Controller, Get, Inject } from '@nestjs/common';
import { AppError } from '@tlc/contracts';

@Controller('test-errors')
export class TestErrorController {
  @Get('internal')
  internalError() {
    throw new AppError('INTERNAL_ERROR', 'Database connection failed: timeout after 30s');
  }

  @Get('not-found')
  notFound() {
    throw new AppError('NOT_FOUND', 'Resource not found');
  }
}
