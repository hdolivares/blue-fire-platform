'use client';

import { useAuth } from "@/context/AuthContext";
import { useRoles } from "@/hooks/useRoles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const { hasRole, getPrimaryRole } = useRoles();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login'); // Redirect to login page after logout
  };

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          {/* Role-based navigation links */}
          <div className="flex items-center space-x-4">
            {/* Admin-specific links */}
            {hasRole(['Admin']) && (
              <Link 
                href="/admin/dashboard" 
                className="text-sm font-semibold hover:underline text-blue-300"
              >
                Admin Dashboard
              </Link>
            )}

            {/* Operator-specific links */}
            {hasRole(['Operator']) && (
              <>
                <Link 
                  href="/operator/dashboard" 
                  className="text-sm font-semibold hover:underline text-orange-300"
                >
                  Operator Dashboard
                </Link>
                <Link 
                  href="/operator/my-requests" 
                  className="text-sm font-semibold hover:underline text-orange-300"
                >
                  My Requests
                </Link>
              </>
            )}

            {/* Investor-specific links */}
            {hasRole(['Investor']) && (
              <Link 
                href="/portfolio" 
                className="text-sm font-semibold hover:underline text-purple-300"
              >
                My Portfolio
              </Link>
            )}

            {/* General dashboard link (for all authenticated users) */}
            <Link 
              href="/dashboard" 
              className="text-sm font-semibold hover:underline"
            >
              Projects
            </Link>
          </div>

          {/* User info and logout */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-secondary">
              Welcome, {user.email}
              {getPrimaryRole() && (
                <Badge variant="info" size="sm" className="ml-2">
                  {getPrimaryRole()}
                </Badge>
              )}
            </span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              Log Out
            </Button>
          </div>
        </>
      ) : (
        <>
          <Link href="/login" className="text-sm font-semibold hover:underline">
            Log In
          </Link>
          <Button variant="primary" size="sm" onClick={() => window.location.href = '/register'}>
            Register
          </Button>
        </>
      )}
    </div>
  );
};