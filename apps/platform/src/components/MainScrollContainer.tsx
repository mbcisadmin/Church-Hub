'use client';

import { useRef, createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { ScrollIndicator } from '@church/nextjs-ui/components/ScrollIndicator';

// Context for pages to control the scroll indicator
interface ScrollIndicatorContextValue {
  setDisabled: (disabled: boolean) => void;
}

const ScrollIndicatorContext = createContext<ScrollIndicatorContextValue | null>(null);

/**
 * Hook for pages to disable the main scroll indicator.
 * Call with `true` to disable, `false` to re-enable.
 *
 * @example
 * ```tsx
 * // In a page component
 * const { setDisabled } = useMainScrollIndicator();
 *
 * useEffect(() => {
 *   setDisabled(true);
 *   return () => setDisabled(false);
 * }, []);
 * ```
 */
export function useMainScrollIndicator() {
  const context = useContext(ScrollIndicatorContext);
  if (!context) {
    // Return a no-op if used outside context (e.g., in tests)
    return { setDisabled: () => {} };
  }
  return context;
}

interface MainScrollContainerProps {
  children: ReactNode;
  /** Content rendered inside the scroll area but after children.
   *  The scroll indicator uses children's boundary, so footer content
   *  placed here won't keep the indicator visible. */
  footer?: ReactNode;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 130;
const DAMPING = 0.4;

/**
 * Wrapper for the main content area that includes a scroll indicator
 * and custom pull-to-refresh on mobile.
 *
 * When a `footer` slot is provided, it scrolls with content but the
 * scroll indicator only tracks the main children area - it hides once
 * children are fully visible, before the footer scrolls into view.
 *
 * Pages can disable the indicator using the useMainScrollIndicator hook.
 */
export function MainScrollContainer({ children, footer }: MainScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [disabled, setDisabled] = useState(false);
  const pathname = usePathname();

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isPullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);

  // Scroll to top on route change
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [pathname]);

  // Pull-to-refresh touch handling (mobile only — touch events don't fire on desktop)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let startY = 0;
    let pullStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      startY = e.touches[0].clientY;
      isPullingRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      const currentY = e.touches[0].clientY;

      if (!isPullingRef.current) {
        // Activate pull mode when at top of scroll and dragging down
        if (container.scrollTop <= 0 && currentY - startY > 5) {
          isPullingRef.current = true;
          pullStartY = currentY;
        }
      }

      if (isPullingRef.current) {
        e.preventDefault();
        const rawDelta = Math.max(0, currentY - pullStartY);
        const damped = Math.min(rawDelta * DAMPING, MAX_PULL);
        pullDistanceRef.current = damped;
        setPullDistance(damped);
      }
    };

    const onTouchEnd = () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        setTimeout(() => window.location.reload(), 800);
      } else {
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  return (
    <ScrollIndicatorContext.Provider value={{ setDisabled }}>
      {/* Relative container for positioning the scroll indicator - flex-1 to fill remaining space */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* Scrolling content area */}
        <div
          ref={scrollRef}
          className="bg-background scrollbar-styled flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain md:overflow-y-scroll"
        >
          {/* Pull-to-refresh indicator — slides out from under header */}
          <div
            className="bg-secondary flex shrink-0 items-center justify-center overflow-hidden"
            style={{
              height: pullDistance,
              transition: isPullingRef.current ? 'none' : 'height 300ms ease-out',
            }}
          >
            {pullDistance > 10 && (
              <div className="flex flex-col items-center gap-1 text-white/60">
                <RefreshCw
                  className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                  style={
                    !isRefreshing ? { transform: `rotate(${pullDistance * 4}deg)` } : undefined
                  }
                />
                <span className="text-xs font-medium tracking-wider uppercase">
                  {isRefreshing
                    ? 'Refreshing...'
                    : pullDistance >= PULL_THRESHOLD
                      ? 'Release to refresh'
                      : 'Pull to refresh'}
                </span>
              </div>
            )}
          </div>

          <div ref={contentRef} className="flex min-w-0 flex-1 flex-col">
            {children}
          </div>
          {footer}
        </div>
        {/* Scroll indicator positioned at bottom of relative container */}
        <ScrollIndicator
          containerRef={scrollRef}
          contentRef={footer ? contentRef : undefined}
          variant="light"
          gradientClass="bg-gradient-to-t from-background to-transparent"
          active={!disabled}
        />
      </div>
    </ScrollIndicatorContext.Provider>
  );
}
