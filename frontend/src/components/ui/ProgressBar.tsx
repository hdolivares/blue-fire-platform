import React from 'react';

interface ProgressBarProps {
  /** Percentage 0–100 */
  value: number;
  className?: string;
  /** Visual treatment of the fill */
  variant?: 'brand' | 'success' | 'accent';
  size?: 'sm' | 'md';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  variant = 'brand',
  size = 'md',
}) => {
  const clamped = Math.max(0, Math.min(100, value));

  const fillClasses: Record<NonNullable<ProgressBarProps['variant']>, string> = {
    brand: 'gradient-brand',
    success: 'bg-success',
    accent: 'bg-accent',
  };

  const heightClasses = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-surface-muted ${heightClasses} ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`${heightClasses} rounded-full transition-all duration-500 ${fillClasses[variant]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
