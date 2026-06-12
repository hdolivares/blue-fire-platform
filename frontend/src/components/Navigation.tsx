'use client';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  label: string;
  href: string;
  roles: string[];
  icon?: string;
}

export const Navigation = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  // Helper function to check if user has any of the specified roles
  const hasRole = (roles: string[]) => {
    return user && roles.some(role => user.roles.includes(role));
  };

  // Helper function to check if link is active
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Navigation items based on roles
  const navigationItems: NavigationItem[] = [
    // Admin-specific items
    {
      label: 'Admin Dashboard',
      href: '/admin/dashboard',
      roles: ['Admin']
    },
    {
      label: 'Create Project',
      href: '/admin/projects/new',
      roles: ['Admin']
    },
    {
      label: 'Manage Projects',
      href: '/admin/projects',
      roles: ['Admin']
    },
    {
      label: 'Manage Investors',
      href: '/admin/investors',
      roles: ['Admin']
    },
    {
      label: 'Manage Users',
      href: '/admin/users',
      roles: ['Admin']
    },

    // Operator-specific items
    {
      label: 'Operator Dashboard',
      href: '/operator/dashboard',
      roles: ['Operator']
    },
    {
      label: 'My Requests',
      href: '/operator/my-requests',
      roles: ['Operator']
    },

    // Investor-specific items
    {
      label: 'Investor Dashboard',
      href: '/dashboard',
      roles: ['Investor']
    },
    {
      label: 'My Portfolio',
      href: '/portfolio',
      roles: ['Investor']
    },
    {
      label: 'Available Projects',
      href: '/projects',
      roles: ['Investor']
    },

    // General items (for all authenticated users)
    {
      label: 'Dashboard',
      href: '/dashboard',
      roles: ['Admin', 'Operator', 'Investor']
    },
    {
      label: 'Projects',
      href: '/projects',
      roles: ['Admin', 'Operator', 'Investor']
    },
  ];

  // Filter navigation items based on user roles
  const filteredItems = navigationItems.filter(item => hasRole(item.roles));

  // Remove duplicates (in case user has multiple roles)
  const uniqueItems = filteredItems.filter((item, index, self) => 
    index === self.findIndex(t => t.href === item.href)
  );

  if (!user) {
    return null; // Don't show navigation for non-authenticated users
  }

  return (
    <nav className="space-y-2">
      {uniqueItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`
            block px-4 py-2 rounded-lg transition-all duration-200
            ${isActive(item.href)
              ? 'bg-surface-muted text-text-primary font-semibold'
              : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
            }
          `}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

// Quick navigation component for specific role sections
export const QuickNavigation = () => {
  const { user } = useAuth();

  if (!user) return null;

  const isAdmin = user.roles.includes('Admin');
  const isOperator = user.roles.includes('Operator');
  const isInvestor = user.roles.includes('Investor');

  return (
    <div className="flex flex-wrap gap-2">
      {isAdmin && (
        <Link
          href="/admin/dashboard"
          className="px-3 py-1 text-xs rounded-full bg-[var(--info-bg)] text-[var(--info-fg)] hover:opacity-80 transition-opacity"
        >
          Admin
        </Link>
      )}
      {isOperator && (
        <Link
          href="/operator/dashboard"
          className="px-3 py-1 text-xs rounded-full bg-[var(--warning-bg)] text-[var(--warning-fg)] hover:opacity-80 transition-opacity"
        >
          Operator
        </Link>
      )}
      {isInvestor && (
        <Link
          href="/portfolio"
          className="px-3 py-1 text-xs rounded-full bg-surface-muted text-brand-secondary hover:opacity-80 transition-opacity"
        >
          Portfolio
        </Link>
      )}
    </div>
  );
}; 