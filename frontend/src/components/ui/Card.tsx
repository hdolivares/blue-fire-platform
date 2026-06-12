import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'frosted' | 'elevated' | 'gradient';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
}) => {
  const baseClasses = 'rounded-xl border transition-all duration-200';

  const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
    default: 'bg-surface border-border',
    frosted: 'glass',
    elevated: 'elevated border-border',
    gradient: 'gradient-brand text-on-brand border-transparent',
  };

  const hoverClasses = hover
    ? 'hover:border-border-strong hover:-translate-y-0.5 hover:shadow-lg'
    : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};
