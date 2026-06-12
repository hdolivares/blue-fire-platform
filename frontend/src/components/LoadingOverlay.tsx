'use client';

import { useAuth } from "@/context/AuthContext";

export const LoadingOverlay = () => {
  const { isLoading } = useAuth();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-surface-muted backdrop-blur-sm flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-primary"></div>
    </div>
  );
};