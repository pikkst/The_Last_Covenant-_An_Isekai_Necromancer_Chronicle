import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { MetricsController } from './observability/metrics.controller';
import { MetricsModule } from './observability/metrics.module';
import { TraceContextMiddleware } from './observability/trace-context.middleware';
import { AppErrorFilter, GenericExceptionFilter } from './observability/errors.filter';

@Module({
  imports: [MetricsModule],
  controllers: [HealthController, MetricsController],
  providers: [AppErrorFilter, GenericExceptionFilter],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TraceContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
