import { Controller, Get } from '@nestjs/common';

type HealthStatus = 'ok' | 'degraded' | 'unavailable';

interface HealthResponse {
  status: HealthStatus;
  service: string;
  checks?: Record<string, HealthStatus>;
}

@Controller('health')
export class HealthController {
  @Get('liveness')
  liveness(): HealthResponse {
    return { status: 'ok', service: 'api' };
  }

  @Get('readiness')
  readiness(): HealthResponse {
    return { status: 'ok', service: 'api' };
  }

  @Get()
  check(): HealthResponse {
    return { status: 'ok', service: 'api' };
  }
}
