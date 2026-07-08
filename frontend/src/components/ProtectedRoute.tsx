'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BrandSpinner } from './BrandSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If no user is logged in, redirect to login
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // If roles are required, check if user has any of the required roles
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => 
          user.roles.includes(role)
        );
        
        if (!hasRequiredRole) {
          // Redirect to dashboard if user doesn't have required role
          router.push('/dashboard');
          return;
        }
      }
    }
  }, [user, loading, requiredRoles, redirectTo, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BrandSpinner label="Authenticating" />
      </div>
    );
  }

  // If no user, don't render children (will redirect)
  if (!user) {
    return null;
  }

  // If roles are required, check if user has required role
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      user.roles.includes(role)
    );
    
    if (!hasRequiredRole) {
      return null; // Will redirect
    }
  }

  return <>{children}</>;
};