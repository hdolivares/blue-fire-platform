'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 1. Import the usePathname hook

export const AdminBar = () => {
  const { user } = useAuth();
  const pathname = usePathname(); // 2. Get the current URL path

  // 3. Add a check for the pathname in the condition
  if (!user || !user.roles.includes('Admin') || pathname === '/admin/dashboard') {
    return null;
  }

  // If all checks pass, render the bar
  return (
    <div className="w-full bg-gradient-accent p-2 text-center text-white text-sm">
      You are logged in as an Admin.{' '}
      <Link href="/admin/dashboard" className="font-bold underline hover:text-gray-200">
        Go to Admin Dashboard &rarr;
      </Link>
    </div>
  );
};