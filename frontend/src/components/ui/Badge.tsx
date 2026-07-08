import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pending' | 'approved' | 'rejected' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  size = 'md',
  className = '',
}) => {
  const baseClasses =
    'inline-flex items-center gap-1.5 rounded-full border border-current/20 font-mono uppercase tracking-[0.1em] font-medium whitespace-nowrap';

  const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
    pending: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]',
    approved: 'bg-[var(--success-bg)] text-[var(--success-fg)]',
    rejected: 'bg-[var(--danger-bg)] text-[var(--danger-fg)]',
    success: 'bg-[var(--success-bg)] text-[var(--success-fg)]',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning-fg)]',
    error: 'bg-[var(--danger-bg)] text-[var(--danger-fg)]',
    info: 'bg-[var(--info-bg)] text-[var(--info-fg)]',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[0.6rem]',
    md: 'px-2.5 py-0.5 text-[0.66rem]',
    lg: 'px-3 py-1 text-[0.72rem]',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};
