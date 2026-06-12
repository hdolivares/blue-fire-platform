'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { OperatorRequestsSection } from '@/components/admin/OperatorRequestsSection';
import { Button } from '@/components/ui/Button';

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
        <div className="text-center p-10">Loading Admin Stats...</div>
      </main>
    );
  }

  return (
    <main className="container-main">
      <div className="mb-8">
        <h1 className="section-header">Admin Dashboard</h1>
        <p className="text-text-secondary mt-2">Welcome to the admin dashboard</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass rounded-lg p-6">
            <p className="text-text-secondary text-sm mb-1">Total Capital Raised</p>
            <p className="text-3xl font-bold">${stats.totalCapitalRaised.toLocaleString()}</p>
          </div>
          <div className="glass rounded-lg p-6">
            <p className="text-text-secondary text-sm mb-1">Active Investors</p>
            <p className="text-3xl font-bold">{stats.totalInvestors}</p>
          </div>
          <div className="glass rounded-lg p-6">
            <p className="text-text-secondary text-sm mb-1">Projects Seeking Funding</p>
            <p className="text-3xl font-bold">{stats.projectsSeekingFunding}</p>
          </div>
          <div className="glass rounded-lg p-6">
            <p className="text-text-secondary text-sm mb-1">Operational Units</p>
            <p className="text-3xl font-bold">{stats.operationalUnits}</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="section-header">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => window.location.href = '/admin/projects'}
            variant="outline"
          >
            📋 View Projects
          </Button>
          <Button 
            onClick={() => window.location.href = '/admin/analytics'}
            variant="primary"
          >
            📊 Analytics
          </Button>
          <Button 
            onClick={() => window.location.href = '/admin/alerts'}
            variant="error"
          >
            🚨 Alerts
          </Button>
          <Button 
            onClick={() => window.location.href = '/admin/projects/new'}
            variant="success"
          >
            + New Project
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <OperatorRequestsSection />
      </div>
    </main>
  );
}