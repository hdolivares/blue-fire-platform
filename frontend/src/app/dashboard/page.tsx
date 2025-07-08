// In frontend/src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ProjectCard } from '@/components/ProjectCard';

// Define a type for our project data for type safety
interface Project {
  _id: string;
  projectName: string;
  fundingGoal: number;
  currentFunding: number;
  status: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Fetch projects from the backend when the page loads
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:3001/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    fetchProjects();
  }, []); // The empty array means this effect runs once on mount

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