'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { StatCard } from '@/components/StatCard';

// Keep this interface to define the shape of our data
interface DashboardStats {
  totalInvestors: number;
  projectsSeekingFunding: number;
  operationalUnits: number;
  totalCapitalRaised: number;
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
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/projects/new" className="bg-gradient-accent text-white font-bold py-2 px-4 rounded-lg transition-all hover:brightness-110">
          + New Project
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Capital Raised" value={`$${stats.totalCapitalRaised.toLocaleString()}`} />
        <StatCard title="Active Investors" value={stats.totalInvestors.toString()} />
        <StatCard title="Projects Seeking Funding" value={stats.projectsSeekingFunding.toString()} />
        <StatCard title="Operational Units" value={stats.operationalUnits.toString()} />
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Manage Projects</h2>
        <div className="card-frosted p-4">
          <ul className="space-y-2">
            {projects.map(project => (
              <li key={project._id} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <div>
                  <p className="font-bold">{project.projectName}</p>
                  <p className="text-sm text-gray-400">{project.status}</p>
                </div>
                <Link href={`/admin/projects/${project._id}`} className="font-semibold text-sm hover:underline">
                  Manage &rarr;
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}