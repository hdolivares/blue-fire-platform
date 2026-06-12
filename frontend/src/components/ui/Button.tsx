import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer focus-ring disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-brand-primary text-on-brand shadow-sm hover:bg-[var(--brand-primary-hover)] hover:shadow-md',
    secondary:
      'bg-surface-muted text-text-primary border border-border hover:border-border-strong',
    accent:
      'bg-accent text-on-brand shadow-md hover:bg-[var(--accent-hover)] hover:shadow-lg',
    success: 'bg-success text-on-brand hover:opacity-90',
    warning: 'bg-warning text-on-brand hover:opacity-90',
    error: 'bg-danger text-on-brand hover:opacity-90',
    outline:
      'bg-transparent border border-border text-text-primary hover:bg-surface-muted hover:border-border-strong',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};
