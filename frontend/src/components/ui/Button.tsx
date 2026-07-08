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
  // Pill + mono caps + fill-sweep on hover (the label sits above the sweep via
  // the z-10 wrapper below). `btn-sweep` provides the rising veil.
  const baseClasses =
    'btn-sweep inline-flex items-center justify-center gap-2 rounded-full font-mono uppercase tracking-[0.14em] leading-none transition-colors duration-300 cursor-pointer focus-ring disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-brand-primary text-on-brand shadow-sm hover:shadow-md [--sweep-color:#eaf5ff]',
    secondary:
      'bg-surface-muted text-text-primary border border-border hover:border-border-strong [--sweep-color:color-mix(in_srgb,var(--brand-primary)_16%,transparent)]',
    accent:
      'bg-accent text-on-brand shadow-md hover:shadow-lg [--sweep-color:#ffb35c]',
    success: 'bg-success text-on-brand [--sweep-color:rgba(255,255,255,0.22)]',
    warning: 'bg-warning text-on-brand [--sweep-color:rgba(255,255,255,0.22)]',
    error: 'bg-danger text-on-brand [--sweep-color:rgba(255,255,255,0.22)]',
    outline:
      'bg-transparent border border-border-strong text-text-primary hover:text-on-brand hover:border-[var(--brand-primary)] [--sweep-color:var(--brand-primary)]',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary [--sweep-color:color-mix(in_srgb,var(--brand-primary)_14%,transparent)]',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-[0.68rem]',
    md: 'px-6 py-2.5 text-[0.72rem]',
    lg: 'px-7 py-3 text-[0.78rem]',
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
