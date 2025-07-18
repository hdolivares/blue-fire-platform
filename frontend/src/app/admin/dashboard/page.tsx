'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

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
        <p className="text-gray-600 mt-2">Welcome to the admin dashboard</p>
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-1">Total Capital Raised</h3>
            <p className="text-3xl font-bold">${stats.totalCapitalRaised.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-1">Active Investors</h3>
            <p className="text-3xl font-bold">{stats.totalInvestors}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-1">Projects Seeking Funding</h3>
            <p className="text-3xl font-bold">{stats.projectsSeekingFunding}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-1">Operational Units</h3>
            <p className="text-3xl font-bold">{stats.operationalUnits}</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="section-header">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/admin/analytics'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            📊 Analytics
          </button>
          <button 
            onClick={() => window.location.href = '/admin/alerts'}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            🚨 Alerts
          </button>
          <button 
            onClick={() => window.location.href = '/admin/projects/new'}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            + New Project
          </button>
        </div>
      </div>
    </main>
  );
}