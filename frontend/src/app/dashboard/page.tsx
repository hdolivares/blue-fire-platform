// In frontend/src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { QuickNavigation } from '@/components/Navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Define a type for our project data for type safety
interface Project {
  _id: string;
  projectName: string;
  fundingGoal: number;
  currentFunding: number;
  status: string;
  imageUrl?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch projects from the backend when the page loads
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/projects');
        setProjects(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch projects:', error);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []); // The empty array means this effect runs once on mount

  // Helper function to get user's primary role
  const getPrimaryRole = () => {
    if (!user) return 'User';
    
    // Priority order: Admin > Operator > Investor
    if (user.roles.includes('Admin')) return 'Admin';
    if (user.roles.includes('Operator')) return 'Operator';
    if (user.roles.includes('Investor')) return 'Investor';
    return 'User';
  };

  // Get role-specific dashboard content
  const getDashboardContent = () => {
    const role = getPrimaryRole();
    
    switch (role) {
      case 'Admin':
        return {
          title: 'Admin Dashboard',
          subtitle: 'Manage projects, users, and platform operations',
          color: 'text-blue-300',
          bgColor: 'bg-blue-500/10',
          actionButton: (
            <Button variant="primary" size="md" onClick={() => window.location.href = '/admin/dashboard'}>
              Full Admin Panel
            </Button>
          )
        };
      case 'Operator':
        return {
          title: 'Operator Dashboard',
          subtitle: 'Monitor and manage your assigned projects',
          color: 'text-orange-300',
          bgColor: 'bg-orange-500/10',
          actionButton: (
            <Button variant="warning" size="md" onClick={() => window.location.href = '/operator/dashboard'}>
              Operator Panel
            </Button>
          )
        };
      case 'Investor':
        return {
          title: 'Investor Dashboard',
          subtitle: 'Discover and invest in water production projects',
          color: 'text-purple-300',
          bgColor: 'bg-purple-500/10',
          actionButton: (
            <Button variant="secondary" size="md" onClick={() => window.location.href = '/portfolio'}>
              View Portfolio
            </Button>
          )
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Welcome to Blue Fire Platform',
          color: 'text-gray-300',
          bgColor: 'bg-gray-300/10',
          actionButton: null
        };
    }
  };

  const dashboardContent = getDashboardContent();

  if (loading) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center">Loading projects...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-8">
        <div className="text-center text-red-500">{error}</div>
      </main>
    );
  }

  return (
    <main className="container-main">
      {/* Role-specific header */}
      <Card variant="frosted" className={`${dashboardContent.bgColor} p-6 mb-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${dashboardContent.color} mb-2`}>
              {dashboardContent.title}
            </h1>
            <p className="text-secondary text-lg">{dashboardContent.subtitle}</p>
            {user && (
              <p className="text-sm text-secondary mt-2">
                Welcome back, {user.email}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {dashboardContent.actionButton}
            <QuickNavigation />
          </div>
        </div>
      </Card>

      {/* Projects section */}
      <div className="mb-8">
        <h2 className="section-header">
          {getPrimaryRole() === 'Admin' ? 'All Projects' : 
           getPrimaryRole() === 'Operator' ? 'Available Projects' : 
           'Projects Seeking Funding'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary text-lg">No projects available at the moment.</p>
            {getPrimaryRole() === 'Admin' && (
              <Button 
                variant="success"
                size="md"
                onClick={() => window.location.href = '/admin/projects/new'}
                className="mt-4"
              >
                Create First Project
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}