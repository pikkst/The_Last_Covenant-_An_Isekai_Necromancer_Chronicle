import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { MetricsController } from './observability/metrics.controller';
import { TraceContextMiddleware } from './observability/trace-context.middleware';

@Module({
  imports: [],
  controllers: [HealthController, MetricsController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TraceContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
