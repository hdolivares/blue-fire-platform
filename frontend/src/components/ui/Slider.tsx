'use client';

import { useState, useEffect, useRef } from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  className?: string;
  disabled?: boolean;
}

export const Slider = ({ 
  min, 
  max, 
  value, 
  onChange, 
  label, 
  showValue = true, 
  className = '',
  disabled = false 
}: SliderProps) => {
  const sliderRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);

  // Calculate progress percentage
  useEffect(() => {
    const progressPercent = ((value - min) / (max - min)) * 100;
    setProgress(progressPercent);
    
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--slider-progress', `${progressPercent}%`);
    }
  }, [value, min, max]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange(newValue);
    
    // Update progress immediately
    const progressPercent = ((newValue - min) / (max - min)) * 100;
    e.target.style.setProperty('--slider-progress', `${progressPercent}%`);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {showValue && (
            <span className="font-bold text-lg ml-2 text-brand-primary">{value}</span>
          )}
        </label>
      )}
      
      <input 
        ref={sliderRef}
        type="range" 
        min={min}
        max={max}
        value={value} 
        onChange={handleChange}
        disabled={disabled}
        className={`w-full slider ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{ '--slider-progress': `${progress}%` } as React.CSSProperties}
      />
      
      <div className="flex justify-between text-xs text-text-secondary">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}; 