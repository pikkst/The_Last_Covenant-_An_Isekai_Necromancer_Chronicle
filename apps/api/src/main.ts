import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnv } from './config';
import { AppErrorFilter, GenericExceptionFilter } from './observability/errors.filter';

async function bootstrap() {
  const config = validateEnv();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalFilters(new AppErrorFilter(), new GenericExceptionFilter());
  await app.listen(config.PORT);
}
bootstrap();
