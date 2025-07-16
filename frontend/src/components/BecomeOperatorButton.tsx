'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';

interface BecomeOperatorButtonProps {
  projectId: string;
  projectName: string;
  onRequestSubmitted?: () => void;
}

export const BecomeOperatorButton = ({ projectId, projectName, onRequestSubmitted }: BecomeOperatorButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post('/operator-requests', {
        projectId: projectId,
      });
      
      toast.success(`Request submitted for ${projectName}!`);
      onRequestSubmitted?.();
    } catch (error: any) {
      console.error('Failed to submit operator request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit request';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      onClick={handleSubmitRequest}
      disabled={isSubmitting}
      variant="warning"
      className="flex items-center justify-center"
    >
      {isSubmitting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Submitting...
        </>
      ) : (
        'Become Operator'
      )}
    </Button>
  );
}; 