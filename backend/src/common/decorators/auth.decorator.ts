import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { ControllerAuthGuard } from '../guards/controller-auth.guard';
import { ControllerRolesGuard } from '../guards/controller-roles.guard';

export const ROLES_KEY = 'roles';

/**
 * @decorator Auth
 * @description Combines authentication and authorization in a single decorator
 * @param roles - Array of roles that can access this endpoint
 * @returns Combined decorators for auth and roles
 */
export const Auth = (...roles: string[]) => {
  if (roles.length === 0) {
    // If no roles specified, just require authentication
    return applyDecorators(UseGuards(ControllerAuthGuard));
  }
  
  // If roles specified, require both authentication and authorization
  return applyDecorators(
    UseGuards(ControllerAuthGuard, ControllerRolesGuard),
    SetMetadata(ROLES_KEY, roles)
  );
};

/**
 * @decorator AdminOnly
 * @description Shorthand for admin-only endpoints
 */
export const AdminOnly = () => Auth('Admin');

/**
 * @decorator InvestorOnly
 * @description Shorthand for investor-only endpoints
 */
export const InvestorOnly = () => Auth('Investor');

/**
 * @decorator OperatorOnly
 * @description Shorthand for operator-only endpoints
 */
export const OperatorOnly = () => Auth('Operator');

/**
 * @decorator AdminOrOperator
 * @description Shorthand for admin or operator endpoints
 */
export const AdminOrOperator = () => Auth('Admin', 'Operator');

/**
 * @decorator Authenticated
 * @description Shorthand for any authenticated user
 */
export const Authenticated = () => Auth(); 