'use client';

import { useRef, useEffect, useCallback, type ReactNode } from 'react';
import { motion, useAnimate } from 'framer-motion';

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.4; // px/ms
const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 };

interface ChartSwiperProps {
  children: ReactNode;
  /** Total number of tabs */
  tabCount: number;
  /** Current active tab index */
  activeIndex: number;
  /** Called with the new index when a swipe is detected */
  onSwipe: (newIndex: number) => void;
  className?: string;
}

/**
 * A touch-based swiper for chart content within a tab.
 *
 * Uses native touch events to swipe between charts. Stops propagation
 * on horizontal swipes so the parent tab gesture (useSwipeGesture on
 * SwipeableContent) doesn't also fire.
 *
 * Visual behavior: content slides left/right during swipe, with a
 * card-flip transition on chart change.
 */
export default function ChartSwiper({
  children,
  tabCount,
  activeIndex,
  onSwipe,
  className = '',
}: ChartSwiperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const isTracking = useRef(false);
  const isAnimating = useRef(false);

  const handleSwipe = useCallback(
    async (direction: 'left' | 'right') => {
      const newIndex = direction === 'left' ? activeIndex + 1 : activeIndex - 1;
      if (newIndex < 0 || newIndex >= tabCount) return;

      isAnimating.current = true;
      const sign = direction === 'left' ? -1 : 1;

      // Continue off-screen in the swipe direction (Framer already tracks position via touchmove)
      await animate(
        scope.current,
        { x: sign * 200, rotateY: sign * 6, opacity: 0 },
        { duration: 0.15 }
      );

      // Position on the opposite side BEFORE swapping content so the new
      // children mount at the off-screen position (not the exit position)
      await animate(
        scope.current,
        { x: sign * -200, rotateY: sign * -6, opacity: 0 },
        { duration: 0 }
      );

      onSwipe(newIndex);

      // Let React render the new content, then animate in
      await new Promise((r) => requestAnimationFrame(r));
      await animate(scope.current, { x: 0, rotateY: 0, opacity: 1 }, SPRING);
      isAnimating.current = false;
    },
    [activeIndex, tabCount, onSwipe, animate, scope]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isAnimating.current) return;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      isTracking.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isAnimating.current || touchStartX.current === null || touchStartY.current === null)
        return;

      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      // Determine if this is a horizontal swipe (vs vertical scroll)
      if (!isTracking.current) {
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          isTracking.current = true;
          e.preventDefault();
          e.stopPropagation();
        } else if (Math.abs(dy) > 10) {
          // Vertical scroll — stop tracking
          touchStartX.current = null;
          return;
        }
        return;
      }

      // We're tracking a horizontal swipe
      e.preventDefault();
      // Stop parent gesture handler (useSwipeGesture on SwipeableContent)
      // from also detecting this as a tab swipe
      e.stopPropagation();

      // Track drag position via Framer so exit animation continues smoothly
      const clamped = Math.max(-200, Math.min(200, dx));
      animate(scope.current, { x: clamped * 0.5, rotateY: (clamped / 200) * 3 }, { duration: 0 });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartTime.current === null || isAnimating.current) {
        isTracking.current = false;
        return;
      }

      const endX = e.changedTouches[0].clientX;
      const dx = endX - touchStartX.current;
      const dt = Date.now() - touchStartTime.current;
      const velocity = dt > 0 ? Math.abs(dx) / dt : 0;

      touchStartX.current = null;
      touchStartY.current = null;
      touchStartTime.current = null;

      if (!isTracking.current) return;
      isTracking.current = false;

      const canGoLeft = activeIndex < tabCount - 1;
      const canGoRight = activeIndex > 0;

      if ((dx < -SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) && dx < 0 && canGoLeft) {
        handleSwipe('left');
      } else if ((dx > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) && dx > 0 && canGoRight) {
        handleSwipe('right');
      } else {
        // Spring back from current position (Framer already tracks it)
        animate(scope.current, { x: 0, rotateY: 0, opacity: 1 }, SPRING);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeIndex, tabCount, handleSwipe, animate, scope]);

  return (
    <div ref={containerRef} className={className} style={{ touchAction: 'pan-y' }}>
      <motion.div
        ref={scope}
        style={{
          perspective: 1200,
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
