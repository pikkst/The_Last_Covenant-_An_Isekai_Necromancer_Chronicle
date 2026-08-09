import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { AuditService } from './audit.service';
import { RateLimitService } from './rate-limit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '../config.module';
import { ConfigService } from '../config.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { csrfMiddleware } from './middleware/csrf.middleware';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET') as string,
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRY') as string },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService, AuditService, RateLimitService, JwtAuthGuard, OptionalAuthGuard, RateLimitGuard],
  exports: [AuthService, SessionService, AuditService, RateLimitService, JwtAuthGuard, OptionalAuthGuard],
})
export class AuthModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer): void {
    consumer.apply(csrfMiddleware).forRoutes('auth');
  }
}
