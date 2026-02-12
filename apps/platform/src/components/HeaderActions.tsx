'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const HEADER_ACTIONS_ID = 'header-actions-portal';

/**
 * Portal target for the header. Renders in the AppHeader on desktop.
 * Pages use <HeaderActionsPortal> to send their action buttons here.
 */
export function HeaderActionsTarget() {
  return <div id={HEADER_ACTIONS_ID} className="flex items-center gap-2" />;
}

/**
 * Portals its children into the AppHeader actions area on large screens.
 * On mobile (< md), renders nothing — pages handle mobile actions differently.
 *
 * @example
 * ```tsx
 * <HeaderActionsPortal>
 *   <PageActionButton icon={Pin} label="Pin" variant="tertiary" />
 *   <PageActionButton icon={Search} label="Search" variant="secondary" />
 *   <PageActionButton icon={Plus} label="Add" variant="primary" />
 * </HeaderActionsPortal>
 * ```
 */
export function HeaderActionsPortal({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      setTarget(null);
      return;
    }

    const resolve = () => {
      const el = document.getElementById(HEADER_ACTIONS_ID);
      if (el) setTarget(el);
    };
    resolve();
    // Retry in case header hasn't mounted yet
    const timer = setTimeout(resolve, 50);
    return () => clearTimeout(timer);
  }, [isDesktop]);

  if (!isDesktop || !target) return null;
  return createPortal(children, target);
}
