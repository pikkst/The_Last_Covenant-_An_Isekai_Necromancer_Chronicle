import { Module } from '@nestjs/common';
import { InMemoryMetrics } from '@tlc/observability';

@Module({
  providers: [InMemoryMetrics],
  exports: [InMemoryMetrics],
})
export class MetricsModule {}
