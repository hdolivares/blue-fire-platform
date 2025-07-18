import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
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
  const baseClasses = 'relative z-0 font-bold transition-all duration-500 cursor-pointer border-0';
  
  const variantClasses = {
    primary: 'neumorphic-primary',
    secondary: 'neumorphic-secondary',
    success: 'neumorphic-success',
    warning: 'neumorphic-warning',
    error: 'neumorphic-error',
    outline: 'neumorphic-outline',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Button text */}
      <span className="button__text relative z-10">
        {children}
      </span>
      
      {/* Removed animated lines for cleaner design */}
    </button>
  );
}; 