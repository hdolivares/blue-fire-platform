'use client';

import { useEffect, useRef, useState } from 'react';
import { Gradient } from '@/lib/Gradient';

export const AnimatedGradient = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);

  const initializeGradient = () => {
    if (canvasRef.current) {
      try {
        // Check if CSS variables are available
        const style = getComputedStyle(document.documentElement);
        const color1 = style.getPropertyValue('--gradient-color-1');
        const color2 = style.getPropertyValue('--gradient-color-2');
        const color3 = style.getPropertyValue('--gradient-color-3');
        const color4 = style.getPropertyValue('--gradient-color-4');
        
        console.log('CSS Variables:', { color1, color2, color3, color4 });
        
        if (!color1 || !color2 || !color3 || !color4) {
          console.warn('CSS variables not loaded, skipping gradient initialization');
          return;
        }
        
        // Destroy existing gradient if it exists
        if (gradientRef.current) {
          try {
            gradientRef.current.disconnect();
          } catch (error) {
            console.warn('Error disconnecting previous gradient:', error);
          }
        }
        
        const gradient: any = new Gradient();
        console.log('Initializing gradient...');
        gradient.initGradient('#gradient-canvas');
        gradientRef.current = gradient;
        setIsInitialized(true);
        console.log('Gradient initialized successfully');
      } catch (error) {
        console.warn('Gradient initialization failed:', error);
      }
    }
  };

  const forceReinitialize = () => {
    console.log('Forcing gradient reinitialization...');
    setIsInitialized(false);
    initializeGradient();
  };

  const setupCssVariableObserver = () => {
    // Create a MutationObserver to watch for changes to CSS variables
    observerRef.current = new MutationObserver((mutations) => {
      let shouldReinitialize = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          // Check if any of our gradient colors changed
          const target = mutation.target as HTMLElement;
          if (target === document.documentElement) {
            const style = getComputedStyle(document.documentElement);
            const color1 = style.getPropertyValue('--gradient-color-1');
            const color2 = style.getPropertyValue('--gradient-color-2');
            const color3 = style.getPropertyValue('--gradient-color-3');
            const color4 = style.getPropertyValue('--gradient-color-4');
            
            // If any color is missing or empty, reinitialize
            if (!color1 || !color2 || !color3 || !color4) {
              shouldReinitialize = true;
            }
          }
        }
      });
      
      if (shouldReinitialize) {
        console.log('CSS variables changed, reinitializing gradient...');
        forceReinitialize();
      }
    });

    // Start observing
    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  };

  useEffect(() => {
    if (canvasRef.current) {
      // Set canvas dimensions
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Add a longer delay to ensure CSS variables are loaded
      const timer = setTimeout(() => {
        initializeGradient();
        setupCssVariableObserver();
      }, 500); // Increased delay

      // Handle window resize
      const handleResize = () => {
        if (canvasRef.current) {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        clearTimeout(timer);
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
        window.removeEventListener('resize', handleResize);
        if (gradientRef.current) {
          try {
            gradientRef.current.disconnect();
          } catch (error) {
            console.warn('Error disconnecting gradient on cleanup:', error);
          }
        }
      };
    }
  }, []);

  // Expose forceReinitialize to window for debugging
  useEffect(() => {
    (window as any).forceGradientReinitialize = forceReinitialize;
    return () => {
      delete (window as any).forceGradientReinitialize;
    };
  }, []);

  return (
    <canvas 
      id="gradient-canvas" 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};