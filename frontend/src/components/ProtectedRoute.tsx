'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles: string[];
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth(); // Get the new loading state
  const router = useRouter();

  useEffect(() => {
    // Wait until the initial loading is done
    if (loading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const hasRequiredRole = user.roles.some(role => roles.includes(role));
    if (!hasRequiredRole) {
      router.push('/dashboard'); 
    }
  }, [user, loading, roles, router]);

  // Show a loading message while we check the user's status
  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  // If checks pass, show the page content
  if (user && user.roles.some(role => roles.includes(role))) {
    return <>{children}</>;
  }

  // Fallback while redirecting
  return <div className="text-center p-10">Loading...</div>;
};