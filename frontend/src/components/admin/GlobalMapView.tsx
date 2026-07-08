'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BrandSpinner } from '../BrandSpinner';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ProjectLocation {
  id: string;
  name: string;
  location: string;
  status: string;
  coordinates: { lat: number; lng: number };
  currentAmount: number;
  goalAmount: number;
  fundingPercentage: number;
  avgHumidity: number;
  avgTemperature: number;
  mainImage: string;
  operator?: {
    firstName: string;
    lastName: string;
  };
}

interface GlobalMapViewProps {
  className?: string;
}

export default function GlobalMapView({ className = '' }: GlobalMapViewProps) {
  const [projects, setProjects] = useState<ProjectLocation[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGlobalMapData();
  }, []);

  const fetchGlobalMapData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/analytics/global-map');
      setProjects(response.data);
    } catch (err) {
      setError('Error loading global map data');
      console.error('Error fetching global map data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'success';
      case 'SEEKING_FUNDING':
        return 'warning';
      case 'FUNDED_MACHINE_SHIPPED':
        return 'info';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'Operational';
      case 'SEEKING_FUNDING':
        return 'Seeking Funding';
      case 'FUNDED_MACHINE_SHIPPED':
        return 'Machine Shipped';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <BrandSpinner label="Loading map" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <p className="text-danger mb-4">{error}</p>
          <Button onClick={fetchGlobalMapData} variant="primary" size="sm">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="display-caps text-3xl mb-2">Global projects map</h2>
        <p className="mono-label !tracking-[0.12em]">
          {projects.length} active projects · {new Set(projects.map(p => p.location.split(',')[0])).size} countries
        </p>
      </div>

      {/* Map Container */}
      <div className="relative bg-surface-muted rounded-xl p-6 border border-border">
        {/* Simplified Map Visualization */}
        <div className="relative h-96 bg-surface rounded-lg overflow-hidden">
          {/* World Map Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTAgMjBIMzBWMzBIMTBWMjBaIiBmaWxsPSIjMzM0MTU1Ii8+CiAgPHBhdGggZD0iTTMwIDIwSDQwVjMwSDMwVjIwWiIgZmlsbD0iIzMzNDE1NSIvPgogIDxwYXRoIGQ9Ik00MCAyMEg1MFYzMEg0MFYyMFoiIGZpbGw9IiMzMzQxNTUiLz4KICA8cGF0aCBkPSJNNTAgMjBINzBWMzBINTBWMjBaIiBmaWxsPSIjMzM0MTU1Ii8+CiAgPHBhdGggZD0iTTcwIDIwSDgwVjMwSDcwVjIwWiIgZmlsbD0iIzMzNDE1NSIvPgogIDxwYXRoIGQ9Ik04MCAyMEg5MFYzMEg4MFYyMFoiIGZpbGw9IiMzMzQxNTUiLz4KICA8cGF0aCBkPSJNMTAgMzBIMzBWNjBIMTBWMzBaIiBmaWxsPSIjMzM0MTU1Ii8+CiAgPHBhdGggZD0iTTMwIDMwSDQwVjYwSDMwVjMwWiIgZmlsbD0iIzMzNDE1NSIvPgogIDxwYXRoIGQ9Ik00MCAzMEg1MFY2MEg0MFYzMFoiIGZpbGw9IiMzMzQxNTUiLz4KICA8cGF0aCBkPSJNNTAgMzBINzBWNjBINTBWMzBaIiBmaWxsPSIjMzM0MTU1Ii8+CiAgPHBhdGggZD0iTTcwIDMwSDgwVjYwSDcwVjMwWiIgZmlsbD0iIzMzNDE1NSIvPgogIDxwYXRoIGQ9Ik04MCAzMEg5MFY2MEg4MFYzMFoiIGZpbGw9IiMzMzQxNTUiLz4KICA8cGF0aCBkPSJNMTAgNjBIMzBWNzBIMTBWNjBaIiBmaWxsPSIjMzM0MTU1Ii8+CiAgPHBhdGggZD0iTTMwIDYwSDQwVjcwSDMwVjYwWiIgZmlsbD0iIzMzNDE1NSIvPgogIDxwYXRoIGQ9Ik00MCA2MEg1MFY3MEg0MFY2MFoiIGZpbGw9IiMzMzQxNTUiLz4KICA8cGF0aCBkPSJNNTAgNjBINzBWNzBINTBWNjBaIiBmaWxsPSIjMzM0MTU1Ii8+CiAgPHBhdGggZD0iTTcwIDYwSDgwVjcwSDcwVjYwWiIgZmlsbD0iIzMzNDE1NSIvPgogIDxwYXRoIGQ9Ik04MCA2MEg5MFY3MEg4MFY2MFoiIGZpbGw9IiMzMzQxNTUiLz4KICA8cGF0aCBkPSJNMTAgNzBIMzBWOThIMTBWNzBaIiBmaWxsPSIjMzM0MTU1Ii8+CiAgPHBhdGggZD0iTTMwIDcwSDQwVjk4SDMwVjcwWiIgZmlsbD0iIzMzNDE1NSIvPgogIDxwYXRoIGQ9Ik00MCA3MEg1MFY5OEg0MFY3MFoiIGZpbGw9IiMzMzQxNTUiLz4KICA8cGF0aCBkPSJNNTAgNzBINzBWOThINTBWNzBaIiBmaWxsPSIjMzM0MTU1Ii8+CiAgPHBhdGggZD0iTTcwIDcwSDgwVjk4SDcwVjcwWiIgZmlsbD0iIzMzNDE1NSIvPgogIDxwYXRoIGQ9Ik04MCA3MEg5MFY5OEg4MFY3MFoiIGZpbGw9IiMzMzQxNTUiLz4KPC9zdmc+')] bg-cover bg-center"></div>
          </div>

          {/* Project Pins */}
          {projects.map((project) => {
            // Calculate position based on coordinates (simplified)
            const left = ((project.coordinates.lng + 180) / 360) * 100;
            const top = ((90 - project.coordinates.lat) / 180) * 100;
            
            return (
              <div
                key={project.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110"
                style={{ left: `${left}%`, top: `${top}%` }}
                onClick={() => setSelectedProject(project)}
              >
                {/* Pin */}
                <div className={`w-4 h-4 rounded-full border-2 border-surface shadow-lg ${
                  project.status === 'OPERATIONAL' ? 'bg-success' :
                  project.status === 'SEEKING_FUNDING' ? 'bg-warning' :
                  'bg-info'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-surface m-0.5"></div>
                </div>

                {/* Pulse effect for operational projects */}
                {project.status === 'OPERATIONAL' && (
                  <div className="absolute inset-0 w-4 h-4 rounded-full bg-success animate-ping opacity-75"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-sm text-text-secondary">Operational</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-sm text-text-secondary">Seeking Funding</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-info"></div>
            <span className="text-sm text-text-secondary">Machine Shipped</span>
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-xl p-6 max-w-md w-full mx-4 border border-border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-text-primary">{selectedProject.name}</h3>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Project Image */}
              {selectedProject.mainImage && (
                <img
                  src={selectedProject.mainImage}
                  alt={selectedProject.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}

              {/* Project Info */}
              <div className="space-y-2">
                                 <div className="flex justify-between">
                   <span className="text-text-secondary">Location:</span>
                   <span className="text-text-primary">{selectedProject.location}</span>
                 </div>

                 <div className="flex justify-between">
                   <span className="text-text-secondary">Status:</span>
                   <Badge variant={getStatusColor(selectedProject.status)}>
                     {getStatusText(selectedProject.status)}
                   </Badge>
                 </div>

                 <div className="flex justify-between">
                   <span className="text-text-secondary">Funding:</span>
                   <span className="text-text-primary">
                     ${selectedProject.currentAmount.toLocaleString()} / ${selectedProject.goalAmount.toLocaleString()}
                   </span>
                 </div>

                 <div className="flex justify-between">
                   <span className="text-text-secondary">Progress:</span>
                   <span className="text-text-primary">{selectedProject.fundingPercentage.toFixed(1)}%</span>
                 </div>

                 {selectedProject.operator && (
                   <div className="flex justify-between">
                     <span className="text-text-secondary">Operator:</span>
                     <span className="text-text-primary">
                       {selectedProject.operator.firstName} {selectedProject.operator.lastName}
                     </span>
                   </div>
                 )}

                 <div className="flex justify-between">
                   <span className="text-text-secondary">Temperature:</span>
                   <span className="text-text-primary">{selectedProject.avgTemperature}°C</span>
                 </div>

                 <div className="flex justify-between">
                   <span className="text-text-secondary">Humidity:</span>
                   <span className="text-text-primary">{selectedProject.avgHumidity}%</span>
                 </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface-muted rounded-full h-2">
                <div
                  className="gradient-brand h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(selectedProject.fundingPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="text-center p-5">
          <div className="text-2xl font-bold tabular-nums text-brand-primary">
            {projects.filter(p => p.status === 'OPERATIONAL').length}
          </div>
          <div className="mono-label mt-2">Operational projects</div>
        </Card>

        <Card className="text-center p-5">
          <div className="text-2xl font-bold tabular-nums text-warning">
            {projects.filter(p => p.status === 'SEEKING_FUNDING').length}
          </div>
          <div className="mono-label mt-2">Seeking funding</div>
        </Card>

        <Card className="text-center p-5">
          <div className="text-2xl font-bold tabular-nums text-success">
            ${projects.reduce((sum, p) => sum + p.currentAmount, 0).toLocaleString()}
          </div>
          <div className="mono-label mt-2">Total capital raised</div>
        </Card>
      </div>
    </div>
  );
} 