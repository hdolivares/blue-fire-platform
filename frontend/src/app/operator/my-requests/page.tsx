'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface OperatorRequest {
  _id: string;
  project: {
    _id: string;
    projectName: string;
    status: string;
    location: string;
  };
  status: string;
  adminFeedback?: string;
  reviewedBy?: {
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  createdAt: string;
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<OperatorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/operator-requests/my-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch my requests:', error);
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'pending';
      case 'APPROVED':
        return 'approved';
      case 'REJECTED':
        return 'rejected';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <main className="container-main">
        <h1 className="section-header">My Operator Requests</h1>
        <div className="text-center py-8">Loading your requests...</div>
      </main>
    );
  }

  return (
    <main className="container-main">
      <h1 className="section-header">My Operator Requests</h1>
      
      {requests.length === 0 ? (
        <Card variant="frosted" className="p-8 text-center">
          <h2 className="section-header">No Requests Yet</h2>
          <p className="text-secondary mb-4">
            You haven't submitted any operator requests yet.
          </p>
          <p className="text-sm text-secondary">
            Browse projects on the dashboard and click "Become Operator" to submit your first request.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request._id} variant="frosted" className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {request.project.projectName}
                  </h3>
                  <p className="text-secondary mb-2">
                    Location: {request.project.location}
                  </p>
                  <p className="text-sm text-secondary">
                    Submitted: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  {request.reviewedAt && (
                    <p className="text-sm text-secondary">
                      Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Badge variant={getStatusVariant(request.status)} size="md">
                    {request.status}
                  </Badge>
                </div>
              </div>

              {request.adminFeedback && (
                <div className="border-t border-light pt-4">
                  <h4 className="font-semibold mb-2">Admin Feedback:</h4>
                  <p className="text-secondary bg-surface-muted p-3 rounded">
                    {request.adminFeedback}
                  </p>
                </div>
              )}

              {request.reviewedBy && (
                <div className="mt-4 text-sm text-secondary">
                  Reviewed by: {request.reviewedBy.firstName} {request.reviewedBy.lastName}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
} 