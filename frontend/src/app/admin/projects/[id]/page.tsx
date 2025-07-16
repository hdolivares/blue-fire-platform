'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { Listbox } from '@headlessui/react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminProjectDetailPage() {
  const params = useParams();
  const { id } = params;
  const { token } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [operators, setOperators] = useState<any[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<any | null>(null);

  const fetchProjectAndOperators = () => {
    if (id && token) {
      api.get(`/projects/${id}`)
        .then((response: any) => {
          setProject(response.data);
          if (response.data.operator) {
            setSelectedOperator(response.data.operator);
          }
        });
      
      api.get('/operators')
        .then((response: any) => {
          setOperators(response.data);
        });
    }
  };

  useEffect(fetchProjectAndOperators, [id, token]);

  const handleAssignOperator = async () => {
    if (!selectedOperator) return;
    try {
      await api.patch(`/admin/projects/${id}/assign-operator`, 
        { operatorId: selectedOperator._id }
      );
      alert('Operator assigned successfully!');
      fetchProjectAndOperators(); // Refresh the data
    } catch (error) {
      console.error('Failed to assign operator:', error);
      alert('Failed to assign operator.');
    }
  };

  if (!project) return <div className="p-10 text-center">Loading Project...</div>;

  return (
    <main className="container-main">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => window.location.href = '/admin/dashboard'}
        className="mb-6"
      >
        &larr; Back to Admin Dashboard
      </Button>
      <h1 className="section-header">{project.projectName}</h1>
      
      <Card variant="frosted" className="mt-8 p-6">
        <h2 className="section-header">Assign Operator</h2>
        {project.operator ? (
          <p className="text-green-400">Currently assigned to: {project.operator.firstName} {project.operator.lastName} ({project.operator.email})</p>
        ) : (
          <p className="text-yellow-400">No operator assigned.</p>
        )}

        <div className="mt-4">
          <label htmlFor="operator-select" className="block text-sm font-medium mb-1">Select an Operator</label>
          <div className="flex items-end space-x-4">
            <div className="flex-grow">
              <Listbox value={selectedOperator} onChange={setSelectedOperator}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white/20 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-white/75 sm:text-sm">
                    <span className="block truncate">{selectedOperator ? `${selectedOperator.firstName} ${selectedOperator.lastName}` : 'Please choose an operator'}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-gray-300" aria-hidden="true"><path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3z" clipRule="evenodd" /></svg>
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                    {operators.map((op) => (
                      <Listbox.Option
                        key={op._id}
                        className={({ active }) => `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? 'bg-purple-500/50 text-white' : 'text-gray-300'}`}
                        value={op}
                      >
                        {({ selected }) => <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{op.firstName} {op.lastName}</span>}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
            <Button
              onClick={handleAssignOperator}
              disabled={!selectedOperator}
              variant="primary"
              size="md"
            >
              {project.operator ? 'Re-assign' : 'Assign'}
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}