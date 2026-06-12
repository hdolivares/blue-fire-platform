'use client';

import { useAuth } from "@/context/AuthContext";
import { useRoles } from "@/hooks/useRoles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const { hasRole, getPrimaryRole } = useRoles();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/login" className="text-sm font-semibold hover:underline">
          Log In
        </Link>
        <Button 
          variant="primary" 
          size="sm" 
          className="font-bold"
          onClick={() => window.location.href = '/register'}
        >
          Register
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Projects Link - Always visible for all users */}
      <Link
        href="/dashboard"
        className="text-sm font-semibold hover:underline text-text-primary"
      >
        Projects
      </Link>

      {/* Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        {/* Profile Trigger Button */}
        <Button
          variant="outline"
          size="sm"
          className="font-bold min-w-[120px]"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-brand rounded-full flex items-center justify-center text-on-brand font-bold text-sm">
              {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline">{user.firstName || 'User'}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </Button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 z-50">
            <Card variant="elevated" className="p-0 shadow-xl border-border overflow-hidden">
              {/* User Info Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 gradient-brand rounded-full flex items-center justify-center text-on-brand font-bold text-lg">
                    {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-primary truncate">
                      Welcome, {user.firstName || 'User'}
                    </h3>
                    <p className="text-sm text-text-secondary truncate">{user.email}</p>
                  </div>
                </div>
                {getPrimaryRole() && (
                  <Badge variant="info" size="sm" className="w-fit">
                    {getPrimaryRole()}
                  </Badge>
                )}
              </div>

              {/* Navigation Links */}
              <div className="p-2">
                {/* Admin-specific links */}
                {hasRole(['Admin']) && (
                  <Link 
                    href="/admin/dashboard" 
                    className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Admin Dashboard
                  </Link>
                )}

                {/* Operator-specific links */}
                {hasRole(['Operator']) && (
                  <>
                    <Link 
                      href="/operator/dashboard" 
                      className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Operator Dashboard
                    </Link>
                    <Link 
                      href="/operator/my-requests" 
                      className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      My Requests
                    </Link>
                  </>
                )}

                {/* Investor-specific links */}
                {hasRole(['Investor']) && (
                  <Link 
                    href="/portfolio" 
                    className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                    </svg>
                    My Portfolio
                  </Link>
                )}
              </div>

              {/* Logout Section */}
              <div className="p-2 border-t border-border">
                <Button
                  onClick={handleLogout}
                  variant="error"
                  size="sm"
                  className="w-full font-bold"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};