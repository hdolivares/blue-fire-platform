// In frontend/src/components/ProjectCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRoles } from '@/hooks/useRoles';
import { BecomeOperatorButton } from './BecomeOperatorButton';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import api from '@/lib/axios';

// The Project interface now supports both the new and old data shapes
// to ensure backward compatibility with existing data in the database.
interface Project {
  _id: string;
  status?: string;
  // New schema fields
  name?: string;
  goalAmount?: number;
  currentAmount?: number;
  mainImage?: string;
  // --- Legacy fields for backward compatibility ---
  projectName?: string;
  fundingGoal?: number;
  currentFunding?: number;
  imageUrl?: string;
}

interface OperatorRequest {
  _id: string;
  status: string;
  project?: {
    _id:string;
  };
}

// Helper functions for status display
const formatStatus = (status: string = '') => {
  return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const getStatusBadgeVariant = (status: string): 'success' | 'info' | 'warning' | 'pending' => {
  switch (status) {
    case 'OPERATIONAL':
      return 'success';
    case 'SEEKING_FUNDING':
      return 'info';
    case 'FUNDED_ORDER_PLACED':
    case 'FUNDED_MACHINE_SHIPPED':
    case 'FUNDED_INSTALLATION_PHASE':
      return 'warning';
    default:
      return 'pending';
  }
};


export const ProjectCard = ({ project }: { project: Project }) => {
  const { user } = useAuth();
  const { hasRole } = useRoles();
  const [hasApplied, setHasApplied] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Use nullish coalescing to safely access properties from either the new or old schema
  const goal = project.goalAmount ?? project.fundingGoal ?? 0;
  const current = project.currentAmount ?? project.currentFunding ?? 0;
  const name = project.name ?? project.projectName ?? 'Untitled Project';
  const image = project.mainImage ?? project.imageUrl;
  
  const fundingPercentage = goal > 0 ? (current / goal) * 100 : 0;

  const isOperator = hasRole(['Operator']);
  const showBecomeOperatorButton = isOperator && project.status === 'SEEKING_FUNDING';

  // Check if user has already applied for this project
  useEffect(() => {
    if (isOperator && user) {
      const checkApplicationStatus = async () => {
        try {
          const response = await api.get('/operator-requests/my-requests');
          const userRequests = response.data;
          const projectRequest = userRequests.find((req: OperatorRequest) => 
            req.project && req.project._id === project._id
          );
          
          if (projectRequest) {
            setHasApplied(true);
            setRequestStatus(projectRequest.status);
          }
        } catch (error) {
          console.error('Failed to check application status:', error);
        } finally {
          setLoading(false);
        }
      };

      checkApplicationStatus();
    } else {
      setLoading(false);
    }
  }, [isOperator, user, project._id]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Application Pending';
      case 'APPROVED':
        return 'Application Approved';
      case 'REJECTED':
        return 'Application Rejected';
      default:
        return 'Already Applied';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'APPROVED':
        return 'bg-green-600 hover:bg-green-700';
      case 'REJECTED':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-gray-300 hover:bg-gray-400';
    }
  };

  return (
    <Card variant="frosted" hover className="flex flex-col justify-between overflow-hidden">
      {/* Image Section - Using a div with background image for robustness */}
      <div 
        className="relative w-full h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${image || '/placeholder-project.jpg'})` }}
      >
        {/* The Image component is no longer needed here */}
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          {/* Header with Project Name and Status Badge */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold">{name}</h3>
            {project.status && (
              <Badge 
                variant={getStatusBadgeVariant(project.status)}
                className="shadow-lg ml-2 flex-shrink-0"
              >
                {formatStatus(project.status)}
              </Badge>
            )}
          </div>
          <p className="text-secondary mb-4">
            Funding Goal: ${goal.toLocaleString()}
          </p>
        </div>

        <div>
          <div className="w-full bg-black/30 rounded-full h-2.5 mb-2">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${fundingPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-right mb-3">{fundingPercentage.toFixed(2)}% Funded</p>
          
          {/* Show appropriate button based on application status */}
          {showBecomeOperatorButton && !loading && (
            <div className="mt-3">
              {!hasApplied ? (
                <BecomeOperatorButton 
                  projectId={project._id} 
                  projectName={name}
                  onRequestSubmitted={() => setHasApplied(true)}
                />
              ) : (
                <Badge 
                  variant={requestStatus === 'APPROVED' ? 'approved' : requestStatus === 'REJECTED' ? 'rejected' : 'pending'}
                  size="lg"
                  className="w-full text-center py-2 opacity-75 cursor-not-allowed"
                >
                  {getStatusText(requestStatus || 'PENDING')}
                </Badge>
              )}
            </div>
          )}
          
          {/* Show view details link for non-operators or when not showing become operator button */}
          {!showBecomeOperatorButton && (
            <Button 
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => window.location.href = `/dashboard/projects/${project._id}`}
            >
              View Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};