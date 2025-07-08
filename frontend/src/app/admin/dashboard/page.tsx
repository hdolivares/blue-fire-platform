'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { StatCard } from '@/components/StatCard';

// Defines the shape of the data we expect from the API
interface DashboardStats {
  totalInvestors: number;
  projectsSeekingFunding: number;
  operationalUnits: number;
  totalCapitalRaised: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // Fetch the dashboard stats from the backend when the page loads
    axios.get('http://localhost:3001/admin/dashboard')
      .then(response => {
        setStats(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch dashboard stats:', error);
      });
  }, []); // The empty array ensures this runs only once when the page loads

  // Show a loading message while we wait for the data
  if (!stats) {
    return <div className="text-center p-10">Loading Admin Stats...</div>;
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/projects/new" className="bg-gradient-accent text-white font-bold py-2 px-4 rounded-lg transition-all hover:brightness-110">
          + New Project
        </Link>
      </div>
      
      {/* This is the grid for our KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Capital Raised" value={`$${stats.totalCapitalRaised.toLocaleString()}`} />
        <StatCard title="Active Investors" value={stats.totalInvestors.toString()} />
        <StatCard title="Projects Seeking Funding" value={stats.projectsSeekingFunding.toString()} />
        <StatCard title="Operational Units" value={stats.operationalUnits.toString()} />
      </div>
    </main>
  );
}