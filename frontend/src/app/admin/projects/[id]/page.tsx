// In frontend/src/app/admin/projects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function AdminProjectDetailPage() {
  const params = useParams();
  const { id } = params;
  const [project, setProject] = useState<any>(null);
  const [operators, setOperators] = useState<any[]>([]);
  const [selectedOperator, setSelectedOperator] = useState('');

  const fetchProject = () => {
    if (id) {
      axios.get(`http://localhost:3001/projects/${id}`)
        .then(response => {
          setProject(response.data);
          // Set the default selected operator if one is already assigned
          if(response.data.operator) {
            setSelectedOperator(response.data.operator._id);
          }
        });
      axios.get('http://localhost:3001/users/operators')
        .then(response => setOperators(response.data));
    }
  };

  useEffect(fetchProject, [id]);

  const handleAssignOperator = async () => {
    try {
      await axios.patch(`http://localhost:3001/admin/projects/${id}/assign-operator`, {
        operatorId: selectedOperator,
      });
      alert('Operator assigned successfully!');
      fetchProject(); // Refresh the project data
    } catch (error) {
      console.error('Failed to assign operator:', error);
      alert('Failed to assign operator.');
    }
  };

  if (!project) return <div className="p-10 text-center">Loading Project...</div>;

  return (
    <main className="container mx-auto p-8">
      <Link href="/admin/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200 mb-6 inline-block">
        &larr; Back to Admin Dashboard
      </Link>
      <h1 className="text-4xl font-bold">{project.projectName}</h1>

      <div className="mt-8 card-frosted p-6">
        <h2 className="text-2xl font-bold mb-4">Assign Operator</h2>
        {project.operator ? (
          <p className="text-green-400">Currently assigned to: {project.operator.firstName} {project.operator.lastName} ({project.operator.email})</p>
        ) : (
          <p className="text-yellow-400">No operator assigned.</p>
        )}

        <div className="mt-4 flex items-end space-x-4">
          <div className="flex-grow">
            <label htmlFor="operator-select" className="block text-sm font-medium mb-1">Select an Operator</label>
            <select 
              id="operator-select"
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="w-full text-black p-2 rounded-md"
            >
              <option value="">-- Please choose an operator --</option>
              {operators.map(op => (
                <option key={op._id} value={op._id}>
                  {op.firstName} {op.lastName} ({op.email})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAssignOperator}
            disabled={!selectedOperator}
            className="bg-gradient-accent text-white font-bold py-2 px-4 rounded-lg transition-all hover:brightness-110 disabled:opacity-50"
          >
            Assign
          </button>
        </div>
      </div>
    </main>
  );
}