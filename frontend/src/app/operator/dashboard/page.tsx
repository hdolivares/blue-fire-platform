'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { ProjectSection } from '@/components/operator/ProjectSection';
import { AssignedProject } from '@/types/project';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
      api.get('/operators/my-project')
        .then((response: any) => { 
          setProjects(response.data) 
        })
        .catch((error: any) => { 
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
    <main className="container-main">
      <div className="mb-8">
        <h1 className="section-header">Operator Dashboard</h1>
        <p className="text-secondary mt-2">Manage your assigned water production units and process purchases.</p>
      </div>
      
      {projects && projects.length > 0 ? (
        <div className="space-y-8">
          {projects.map(project => <ProjectSection key={project._id} project={project} />)}
        </div>
      ) : (
        <Card variant="frosted" className="p-12 text-center max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">No Project Assigned</h2>
            <p className="text-secondary">Please contact an administrator to be assigned to an operational unit.</p>
          </div>
          <Button variant="secondary" size="lg">
            Contact Administrator
          </Button>
        </Card>
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