import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/auth.decorator';

@Injectable()
export class ControllerRolesGuard implements CanActivate {
  private readonly logger = new Logger(ControllerRolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // If no user is present, deny access
    if (!user) {
      this.logger.warn('Access denied: No user found in request');
      return false;
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => 
      user.roles && user.roles.includes(role)
    );

    if (!hasRole) {
      this.logger.warn(
        `Access denied: User ${user.email} (${user.userId}) lacks required roles. Required: ${requiredRoles.join(', ')}, Has: ${user.roles?.join(', ') || 'none'}`
      );
    }

    return hasRole;
  }
} 