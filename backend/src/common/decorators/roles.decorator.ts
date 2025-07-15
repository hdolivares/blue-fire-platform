import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Predefined role constants
export const Role = {
  ADMIN: 'admin',
  INVESTOR: 'investor',
  OPERATOR: 'operator',
  USER: 'user',
} as const;

export type UserRole = typeof Role[keyof typeof Role]; 