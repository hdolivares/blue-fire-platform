// In frontend/src/components/AnimatedGradientProvider.tsx
'use client'; // This directive marks the component as a Client Component

import dynamic from 'next/dynamic';

// This dynamically imports the component and disables SSR for it
const AnimatedGradient = dynamic(
  () => import('@/components/AnimatedGradient').then(mod => mod.AnimatedGradient),
  { ssr: false }
);

export const AnimatedGradientProvider = () => {
  return <AnimatedGradient />;
};