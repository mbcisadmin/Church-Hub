'use client';

import { type ReactNode } from 'react';
import { useSwipeableContext } from './SwipeableContext';

interface SwipeableContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps tab content and registers it as a swipe surface.
 * Must be used inside a <SwipeableProvider>.
 *
 * Swiping horizontally on this area changes tabs via the provider's gesture hook.
 * Vertical scrolling passes through normally.
 */
export function SwipeableContent({ children, className = '' }: SwipeableContentProps) {
  const ctx = useSwipeableContext();
  if (!ctx) {
    throw new Error('SwipeableContent must be used inside a SwipeableProvider');
  }

  return (
    <div ref={ctx.contentRef} className={className}>
      {children}
    </div>
  );
}
