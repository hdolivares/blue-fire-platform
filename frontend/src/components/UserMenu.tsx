'use client';

import { useAuth } from "@/context/AuthContext";
import { useRoles } from "@/hooks/useRoles";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
              <Link 
                href="/operator/dashboard" 
                className="text-sm font-semibold hover:underline text-orange-300"
              >
                Operator Dashboard
              </Link>
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
            <span className="text-sm text-gray-300">
              Welcome, {user.email}
              {getPrimaryRole() && (
                <span className="ml-2 px-2 py-1 text-xs bg-white/10 rounded-full">
                  {getPrimaryRole()}
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition-all hover:bg-white/20"
            >
              Log Out
            </button>
          </div>
        </>
      ) : (
        <>
          <Link href="/login" className="text-sm font-semibold hover:underline">
            Log In
          </Link>
          <Link href="/register" className="bg-gradient-accent text-white font-bold py-2 px-4 rounded-lg transition-all hover:brightness-110">
            Register
          </Link>
        </>
      )}
    </div>
  );
};