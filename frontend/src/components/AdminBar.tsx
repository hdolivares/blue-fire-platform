'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const AdminBar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isAdmin = user.roles.includes('Admin');
  const isOperator = user.roles.includes('Operator');
  const isInvestor = user.roles.includes('Investor');

  // Don't show the bar if user is already on their primary dashboard
  if (isAdmin && pathname.startsWith('/admin/')) return null;
  if (isOperator && pathname.startsWith('/operator/')) return null;
  if (isInvestor && pathname === '/dashboard') return null;

  // Get the appropriate message and link based on user's primary role
  const getRoleInfo = () => {
    if (isAdmin) {
      return {
        message: 'You are logged in as an Admin.',
        link: '/admin/dashboard',
        linkText: 'Go to Admin Dashboard',
        color: 'bg-gradient-to-r from-blue-600 to-blue-800'
      };
    }
    if (isOperator) {
      return {
        message: 'You are logged in as an Operator.',
        link: '/operator/dashboard',
        linkText: 'Go to Operator Dashboard',
        color: 'bg-gradient-to-r from-orange-600 to-orange-800'
      };
    }
    if (isInvestor) {
      return {
        message: 'You are logged in as an Investor.',
        link: '/dashboard',
        linkText: 'Go to Investor Dashboard',
        color: 'bg-gradient-to-r from-purple-600 to-purple-800'
      };
    }
    return null;
  };

  const roleInfo = getRoleInfo();
  if (!roleInfo) return null;

  return (
    <div className={`w-full ${roleInfo.color} p-2 text-center text-white text-sm`}>
      {roleInfo.message}{' '}
      <Link href={roleInfo.link} className="font-bold underline hover:text-gray-200">
        {roleInfo.linkText} &rarr;
      </Link>
    </div>
  );
};