// In frontend/src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import Link from 'next/link';
import api from '@/lib/axios';

// Define a type for our project data for type safety
interface Project {
  _id: string;
  projectName: string;
  fundingGoal: number;
  currentFunding: number;
  status: string;
  imageUrl?: string; // Make imageUrl optional since it might not always be present
}

export default function DashboardPage() {
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
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Investor Dashboard</h1>
      <h2 className="text-2xl font-semibold mb-4 text-gray-300">Projects Seeking Funding</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </main>
  );
}