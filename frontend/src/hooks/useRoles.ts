import { useAuth } from '@/context/AuthContext';

export const useRoles = () => {
  const { user } = useAuth();

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.some(role => user.roles.includes(role));
  };

  const hasAnyRole = (roles: string[]) => {
    return hasRole(roles);
  };

  const hasAllRoles = (roles: string[]) => {
    if (!user) return false;
    return roles.every(role => user.roles.includes(role));
  };

  const getPrimaryRole = () => {
    if (!user) return null;
    
    // Priority order: Admin > Operator > Investor
    if (user.roles.includes('Admin')) return 'Admin';
    if (user.roles.includes('Operator')) return 'Operator';
    if (user.roles.includes('Investor')) return 'Investor';
    return 'User';
  };

  const isAdmin = () => hasRole('Admin');
  const isOperator = () => hasRole('Operator');
  const isInvestor = () => hasRole('Investor');

  return {
    user,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getPrimaryRole,
    isAdmin,
    isOperator,
    isInvestor,
    roles: user?.roles || []
  };
}; 