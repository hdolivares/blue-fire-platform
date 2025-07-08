// In frontend/src/components/AnimatedGradient.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Gradient } from '@/lib/Gradient';

export const AnimatedGradient = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Add ': any' here to fix the TypeScript error
      const gradient: any = new Gradient();
      gradient.initGradient('#gradient-canvas');
    }
  }, []);

  return <canvas id="gradient-canvas" ref={canvasRef} className="fixed top-0 left-0 -z-10"></canvas>;
};