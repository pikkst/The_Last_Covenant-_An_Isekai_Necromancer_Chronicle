import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { MetricsController } from './observability/metrics.controller';
import { MetricsModule } from './observability/metrics.module';
import { TraceContextMiddleware } from './observability/trace-context.middleware';
import { AppErrorFilter, GenericExceptionFilter } from './observability/errors.filter';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { SaveSlotModule } from './save-slot/save-slot.module';

@Module({
  imports: [MetricsModule, AuthModule, MeModule, SaveSlotModule],
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
