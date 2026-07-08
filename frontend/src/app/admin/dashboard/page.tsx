'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { OperatorRequestsSection } from '@/components/admin/OperatorRequestsSection';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/StatCard';
import { BrandSpinner } from '@/components/BrandSpinner';
import {
  CurrencyDollarIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  BellAlertIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalInvestors: number;
  projectsSeekingFunding: number;
  operationalUnits: number;
  totalCapitalRaised: number;
  pendingOperatorRequests: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((response) => {
        setStats(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch dashboard stats:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="container-main">
        <div className="flex justify-center py-24">
          <BrandSpinner label="Loading stats" />
        </div>
      </main>
    );
  }

  return (
    <main className="container-main">
      <div className="mb-8">
        <p className="kicker mb-2"><b>◇</b> Control</p>
        <h1 className="section-header !mb-0">Admin dashboard</h1>
      </div>

      {stats && (
        <div className="stagger-rise grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total capital raised" value={`$${stats.totalCapitalRaised.toLocaleString()}`} icon={<CurrencyDollarIcon className="h-5 w-5" />} />
          <StatCard title="Active investors" value={String(stats.totalInvestors)} icon={<UsersIcon className="h-5 w-5" />} />
          <StatCard title="Seeking funding" value={String(stats.projectsSeekingFunding)} icon={<MagnifyingGlassIcon className="h-5 w-5" />} />
          <StatCard title="Operational units" value={String(stats.operationalUnits)} icon={<BoltIcon className="h-5 w-5" />} />
        </div>
      )}

      <div className="mt-10">
        <h2 className="section-header">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button onClick={() => (window.location.href = '/admin/projects')} variant="outline">
            <ClipboardDocumentListIcon className="h-4 w-4" />
            View Projects
          </Button>
          <Button onClick={() => (window.location.href = '/admin/analytics')} variant="primary">
            <ChartBarIcon className="h-4 w-4" />
            Analytics
          </Button>
          <Button onClick={() => (window.location.href = '/admin/alerts')} variant="error">
            <BellAlertIcon className="h-4 w-4" />
            Alerts
          </Button>
          <Button onClick={() => (window.location.href = '/admin/projects/new')} variant="success">
            <PlusIcon className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <OperatorRequestsSection />
      </div>
    </main>
  );
}
