'use client';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  label: string;
  href: string;
  roles: string[];
  icon?: string;
  color?: string;
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
      roles: ['Admin'],
      color: 'text-blue-300'
    },
    {
      label: 'Create Project',
      href: '/admin/projects/new',
      roles: ['Admin'],
      color: 'text-green-300'
    },
    {
      label: 'Manage Projects',
      href: '/admin/projects',
      roles: ['Admin'],
      color: 'text-yellow-300'
    },
    {
      label: 'Manage Investors',
      href: '/admin/investors',
      roles: ['Admin'],
      color: 'text-purple-300'
    },
    {
      label: 'Manage Users',
      href: '/admin/users',
      roles: ['Admin'],
      color: 'text-indigo-300'
    },

    // Operator-specific items
    {
      label: 'Operator Dashboard',
      href: '/operator/dashboard',
      roles: ['Operator'],
      color: 'text-orange-300'
    },
    {
      label: 'My Projects',
      href: '/operator/projects',
      roles: ['Operator'],
      color: 'text-orange-300'
    },

    // Investor-specific items
    {
      label: 'Investor Dashboard',
      href: '/dashboard',
      roles: ['Investor'],
      color: 'text-purple-300'
    },
    {
      label: 'My Portfolio',
      href: '/portfolio',
      roles: ['Investor'],
      color: 'text-purple-300'
    },
    {
      label: 'Available Projects',
      href: '/projects',
      roles: ['Investor'],
      color: 'text-purple-300'
    },

    // General items (for all authenticated users)
    {
      label: 'Dashboard',
      href: '/dashboard',
      roles: ['Admin', 'Operator', 'Investor'],
      color: 'text-gray-300'
    },
    {
      label: 'Projects',
      href: '/projects',
      roles: ['Admin', 'Operator', 'Investor'],
      color: 'text-gray-300'
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
              ? 'bg-white/20 text-white font-semibold' 
              : `${item.color || 'text-gray-300'} hover:bg-white/10 hover:text-white`
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
          className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full hover:bg-blue-500/30"
        >
          Admin
        </Link>
      )}
      {isOperator && (
        <Link 
          href="/operator/dashboard"
          className="px-3 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full hover:bg-orange-500/30"
        >
          Operator
        </Link>
      )}
      {isInvestor && (
        <Link 
          href="/portfolio"
          className="px-3 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full hover:bg-purple-500/30"
        >
          Portfolio
        </Link>
      )}
    </div>
  );
}; 