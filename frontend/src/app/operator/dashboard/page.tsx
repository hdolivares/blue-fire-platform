'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { ProjectSection } from '@/components/operator/ProjectSection';
import { AssignedProject } from '@/types/project';

/**
 * @component OperatorDashboard
 * @description The main page component that fetches the list of assigned projects
 * and renders a ProjectSection for each one.
 */
const OperatorDashboard = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<AssignedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:3001/operators/my-project', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => { 
        setProjects(response.data) 
      })
      .catch(error => { 
        console.error("Failed to fetch projects", error);
        toast.error("Could not load your assigned project.");
      })
      .finally(() => { setLoading(false) });
    } else if (token === null) {
      setLoading(false);
    }
  }, [token]);


  if (loading) {
    return <div className="text-center p-10">Loading Your Project(s)...</div>;
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Operator Dashboard</h1>
      {projects && projects.length > 0 ? (
        projects.map(project => <ProjectSection key={project._id} project={project} />)
      ) : (
        <div className="card-frosted p-8 text-center">
          <h2 className="text-2xl font-bold">No Project Assigned</h2>
          <p className="mt-2 text-gray-300">Please contact an administrator to be assigned to an operational unit.</p>
        </div>
      )}
    </main>
  );
};

/**
 * @component OperatorDashboardPage
 * @description A wrapper component needed to use hooks like useSearchParams within a Suspense boundary.
 */
export default function OperatorDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OperatorDashboard />
    </Suspense>
  )
}