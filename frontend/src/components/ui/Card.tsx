import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'frosted' | 'gradient';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
}) => {
  const baseClasses = 'rounded-lg border transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white/5 border-white/10',
    frosted: 'bg-white/5 backdrop-blur-sm border-white/10 shadow-lg',
    gradient: 'bg-gradient-to-br from-white/10 to-white/5 border-white/10',
  };
  
  const hoverClasses = hover ? 'hover:border-white/20 hover:scale-105' : '';
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}; 