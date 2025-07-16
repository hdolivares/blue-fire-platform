'use client';

import dynamic from 'next/dynamic';

const AdminBar = dynamic(() => import('./AdminBar').then(mod => ({ default: mod.AdminBar })), {
  ssr: false,
});

export default function ClientAdminBar() {
  return <AdminBar />;
} 