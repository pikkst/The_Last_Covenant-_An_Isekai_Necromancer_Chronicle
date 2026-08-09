import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnv } from './config';

async function bootstrap() {
  const config = validateEnv();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(config.PORT);
}
bootstrap();
