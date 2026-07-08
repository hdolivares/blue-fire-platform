'use client';

import { useAuth } from "@/context/AuthContext";
import { BrandSpinner } from "./BrandSpinner";

export const LoadingOverlay = () => {
  const { isLoading } = useAuth();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:color-mix(in_srgb,var(--background)_82%,transparent)] backdrop-blur-md">
      <BrandSpinner />
    </div>
  );
};