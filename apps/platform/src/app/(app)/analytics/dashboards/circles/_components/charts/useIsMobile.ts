'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the viewport is mobile-sized.
 * Uses 768px (md breakpoint) as the threshold.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
