'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { AnimatedGradientProvider } from './AnimatedGradientProvider';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export const LandingLayout = ({ children }: LandingLayoutProps) => {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <>
      {!isLandingPage && <AnimatedGradientProvider />}
      {!isLandingPage && <Header />}
      {children}
    </>
  );
}; 