import React from 'react';

/** Shimmering placeholder block. Compose these to mirror real layout. */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="skeleton h-3"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
);

/** Card-shaped skeleton for stat/project grids. */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`rounded-xl border border-border bg-surface p-6 ${className}`}
    aria-hidden="true"
  >
    <Skeleton className="h-3 w-24" />
    <Skeleton className="mt-4 h-8 w-32" />
    <Skeleton className="mt-4 h-2 w-full" />
  </div>
);
