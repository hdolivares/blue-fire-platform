'use client';

interface LottieAnimationProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const LottieAnimation = ({ 
  src, 
  loop = true, 
  autoplay = true, 
  style = {}, 
  className = '' 
}: LottieAnimationProps) => {
  // Create animated placeholders instead of trying to load .lottie files
  const isHeroAnimation = src.includes('Loading');
  const isWaterAnimation = src.includes('WaterMorph');

  if (isHeroAnimation) {
    return (
      <div 
        style={style} 
        className={`${className} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 animate-pulse rounded-full"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-600/30 animate-spin-slow rounded-full"></div>
        <div className="absolute inset-4 bg-gradient-to-tl from-cyan-400/20 to-blue-600/20 animate-pulse rounded-full"></div>
      </div>
    );
  }

  if (isWaterAnimation) {
    return (
      <div 
        style={style} 
        className={`${className} relative overflow-hidden`}
      >
        <div className="w-full h-full bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full animate-pulse"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/40 to-blue-600/40 animate-bounce rounded-full"></div>
        <div className="absolute inset-4 bg-gradient-to-tl from-blue-300/30 to-purple-500/30 animate-ping rounded-full"></div>
      </div>
    );
  }

  // Fallback for any other animations
  return (
    <div 
      style={style} 
      className={`${className} animate-pulse bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg`}
    />
  );
}; 