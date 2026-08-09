import { Controller, Get, Inject } from '@nestjs/common';
import { InMemoryMetrics } from '@tlc/observability';

@Controller('metrics')
export class MetricsController {
  constructor(@Inject(InMemoryMetrics) private readonly metrics: InMemoryMetrics) {}

  @Get()
  getMetrics() {
    return {
      format: 'json',
      metrics: this.metrics.collect(),
    };
  }
}
