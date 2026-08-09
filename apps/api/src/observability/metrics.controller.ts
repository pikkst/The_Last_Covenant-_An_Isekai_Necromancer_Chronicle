import { Controller, Get } from '@nestjs/common';
import { InMemoryMetrics } from '@tlc/observability';

@Controller('metrics')
export class MetricsController {
  private readonly metrics = new InMemoryMetrics();

  @Get()
  getMetrics() {
    return {
      format: 'json',
      metrics: this.metrics.collect(),
    };
  }
}
