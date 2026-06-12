'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true once the window has scrolled past `threshold` pixels.
 * Used to intensify the sticky header (solid surface + shadow) on scroll.
 */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll(); // sync initial state (e.g. on refresh mid-page)
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
