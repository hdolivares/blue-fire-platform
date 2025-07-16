'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface OperatorRequest {
  _id: string;
  operator: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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

export const OperatorRequestsSection = () => {
  const [requests, setRequests] = useState<OperatorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingRequest, setReviewingRequest] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/operator-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch operator requests:', error);
      toast.error('Failed to load operator requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    if (reviewingRequest) return;

    setReviewingRequest(requestId);
    try {
      await api.patch(`/operator-requests/${requestId}/review`, {
        status,
        feedback: feedback.trim() || undefined,
      });

      toast.success(`Request ${status.toLowerCase()} successfully`);
      setFeedback('');
      fetchRequests(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to review request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to review request';
      toast.error(errorMessage);
    } finally {
      setReviewingRequest(null);
    }
  };

    if (loading) {
    return (
      <Card variant="frosted" className="p-6">
        <h2 className="section-header">Operator RFP Submissions</h2>
        <div className="text-center py-8">Loading requests...</div>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card variant="frosted" className="p-6">
        <h2 className="section-header">Operator RFP Submissions</h2>
        <div className="text-center py-8 text-secondary">
          No pending operator requests at the moment.
        </div>
      </Card>
    );
  }

  return (
    <Card variant="frosted" className="p-6">
      <h2 className="section-header">Operator RFP Submissions</h2>
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request._id} variant="default" className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {request.operator.firstName} {request.operator.lastName}
                </h3>
                <p className="text-secondary">{request.operator.email}</p>
                <p className="text-sm mt-1">
                  Wants to operate: <span className="font-medium">{request.project.projectName}</span>
                </p>
                <p className="text-xs text-secondary mt-1">
                  Submitted: {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="pending" size="sm">
                  PENDING
                </Badge>
              </div>
            </div>

            <div className="border-t border-light pt-3">
              <textarea
                placeholder="Add feedback (optional)..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="input-field w-full mb-3 resize-none"
                rows={2}
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleReviewRequest(request._id, 'APPROVED')}
                  disabled={reviewingRequest === request._id}
                  variant="success"
                  size="sm"
                >
                  {reviewingRequest === request._id ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  onClick={() => handleReviewRequest(request._id, 'REJECTED')}
                  disabled={reviewingRequest === request._id}
                  variant="error"
                  size="sm"
                >
                  {reviewingRequest === request._id ? 'Processing...' : 'Reject'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}; 