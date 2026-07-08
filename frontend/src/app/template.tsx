'use client';

import { usePathname } from 'next/navigation';

/**
 * Re-mounts on every navigation, so app routes fade+rise in on entry. The
 * landing (/) owns its own preloader choreography and is left untouched.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/') return <>{children}</>;
  return <div className="page-enter">{children}</div>;
}
