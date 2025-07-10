'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function OperatorDashboardPage() {
  const { token } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:3001/operators/my-project', {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token for authentication
        },
      })
      .then(response => {
        setProject(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch assigned project:', error);
        setLoading(false);
      });
    }
  }, [token]);

  if (loading) {
    return <div className="text-center p-10">Loading Your Project...</div>;
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Operator Dashboard</h1>
      {project ? (
        <div className="card-frosted p-6">
          <h2 className="text-2xl font-bold">{project.projectName}</h2>
          <p className="text-lg text-green-400 font-semibold">{project.status}</p>
          {/* We will add the 'Purchase Water' button here next */}
        </div>
      ) : (
        <p>You have not been assigned to a project yet.</p>
      )}
    </main>
  );
}