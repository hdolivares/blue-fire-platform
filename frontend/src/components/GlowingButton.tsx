// In frontend/src/components/GlowingButton.tsx
'use client';

import React from 'react';

interface GlowingButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const GlowingButton = ({ children, onClick }: GlowingButtonProps) => {
  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {/* This div creates the animated glow effect */}
      <div
        className="absolute -inset-0.5 bg-gradient-accent rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
      ></div>
      {/* This is the actual button content */}
      <div
        className="relative px-7 py-4 bg-sky-500 rounded-lg leading-none flex items-center justify-center"
      >
        <span className="text-white font-bold">{children}</span>
      </div>
    </div>
  );
};