import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route is marked as public, allow access
    if (isPublic) {
      this.logger.debug('Public route accessed, skipping authentication');
      return true;
    }

    // Otherwise, proceed with JWT authentication
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's an error or no user, log it and throw an appropriate error
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      this.logger.warn(
        `Authentication failed for ${request.method} ${request.url}: ${info?.message || err?.message || 'No auth token'}`
      );
      
      // Throw proper HTTP exception
      throw new UnauthorizedException('Authentication required');
    }

    return user;
  }
} 