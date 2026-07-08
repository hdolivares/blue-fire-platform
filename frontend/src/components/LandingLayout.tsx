'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import AppBackground from './AppBackground';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export const LandingLayout = ({ children }: LandingLayoutProps) => {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <>
      {!isLandingPage && <AppBackground />}
      {!isLandingPage && <Header />}
      {children}
    </>
  );
}; 