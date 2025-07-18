'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { StatCard } from '@/components/StatCard';
import { OperatorRequestsSection } from '@/components/admin/OperatorRequestsSection';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Keep this interface to define the shape of our data
interface DashboardStats {
  totalInvestors: number;
  projectsSeekingFunding: number;
  operationalUnits: number;
  totalCapitalRaised: number;
  pendingOperatorRequests: number;
}

interface Project {
  _id: string;
  projectName: string;
  status: string;
}

export default function AdminDashboardPage() {
  // Use the DashboardStats interface for our state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((response: any) => setStats(response.data))
      .catch((error: any) => console.error('Failed to fetch dashboard stats:', error));
    
    api.get('/projects')
      .then((response: any) => setProjects(response.data))
      .catch((error: any) => console.error('Failed to fetch projects:', error));
  }, []);

  if (!stats) {
    return <div className="text-center p-10">Loading Admin Stats...</div>;
  }

  return (
    <main className="container-main">
      <div className="flex justify-between items-center mb-8">
        <h1 className="section-header">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="md" onClick={() => window.location.href = '/admin/analytics'}>
            📊 Analytics
          </Button>
          <Button variant="primary" size="md" onClick={() => window.location.href = '/admin/projects/new'}>
            + New Project
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Capital Raised" value={`$${stats.totalCapitalRaised.toLocaleString()}`} />
        <StatCard title="Active Investors" value={stats.totalInvestors.toString()} />
        <StatCard title="Projects Seeking Funding" value={stats.projectsSeekingFunding.toString()} />
        <StatCard title="Operational Units" value={stats.operationalUnits.toString()} />
        <StatCard title="Pending Operator Requests" value={stats.pendingOperatorRequests.toString()} />
      </div>

      <div className="mt-12">
        <h2 className="section-header">Manage Projects</h2>
        <Card variant="frosted" className="p-4">
          <ul className="space-y-2">
            {projects.map(project => (
              <li key={project._id} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <div>
                  <p className="font-bold">{project.projectName}</p>
                  <p className="text-sm text-secondary">{project.status}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = `/admin/projects/${project._id}`}
                  className="font-semibold text-sm"
                >
                  Manage &rarr;
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Operator Requests Section */}
      <div className="mt-12">
        <OperatorRequestsSection />
      </div>
    </main>
  );
}