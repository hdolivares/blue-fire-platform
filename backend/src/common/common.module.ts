import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { ControllerAuthGuard } from './guards/controller-auth.guard';
import { ControllerRolesGuard } from './guards/controller-roles.guard';

/**
 * Global cross-cutting providers. Security is DEFAULT-ON: every route requires
 * a valid JWT (ControllerAuthGuard) unless explicitly marked `@Public()`, and
 * role metadata from `@Auth()/@AdminOnly()/@Roles()` is enforced
 * (ControllerRolesGuard). Guards run in registration order, so auth resolves
 * `req.user` before the roles check.
 */
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ControllerAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ControllerRolesGuard,
    },
  ],
})
export class CommonModule {}