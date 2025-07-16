/**
 * Utility functions for managing gradient colors
 */

export interface GradientColors {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
}

/**
 * Update gradient colors by setting CSS variables
 */
export const updateGradientColors = (colors: Partial<GradientColors>) => {
  const root = document.documentElement;
  
  if (colors.color1) {
    root.style.setProperty('--gradient-color-1', colors.color1);
  }
  if (colors.color2) {
    root.style.setProperty('--gradient-color-2', colors.color2);
  }
  if (colors.color3) {
    root.style.setProperty('--gradient-color-3', colors.color3);
  }
  if (colors.color4) {
    root.style.setProperty('--gradient-color-4', colors.color4);
  }
  
  console.log('Gradient colors updated:', colors);
};

/**
 * Get current gradient colors from CSS variables
 */
export const getCurrentGradientColors = (): GradientColors => {
  const style = getComputedStyle(document.documentElement);
  
  return {
    color1: style.getPropertyValue('--gradient-color-1'),
    color2: style.getPropertyValue('--gradient-color-2'),
    color3: style.getPropertyValue('--gradient-color-3'),
    color4: style.getPropertyValue('--gradient-color-4')
  };
};

/**
 * Force gradient reinitialization (available globally for debugging)
 */
export const forceGradientReinitialize = () => {
  if ((window as any).forceGradientReinitialize) {
    (window as any).forceGradientReinitialize();
  } else {
    console.warn('Gradient reinitialize function not available');
  }
};

/**
 * Preset gradient color schemes
 */
export const gradientPresets = {
  blue: {
    color1: '#667eea',
    color2: '#2487d8',
    color3: '#6659f8',
    color4: '#512494'
  },
  purple: {
    color1: '#8b5cf6',
    color2: '#a855f7',
    color3: '#c084fc',
    color4: '#7c3aed'
  },
  green: {
    color1: '#10b981',
    color2: '#059669',
    color3: '#34d399',
    color4: '#047857'
  },
  red: {
    color1: '#ef4444',
    color2: '#dc2626',
    color3: '#f87171',
    color4: '#b91c1c'
  },
  orange: {
    color1: '#f97316',
    color2: '#ea580c',
    color3: '#fb923c',
    color4: '#c2410c'
  }
}; 