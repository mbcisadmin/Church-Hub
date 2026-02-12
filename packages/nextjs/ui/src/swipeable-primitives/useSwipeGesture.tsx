'use client';

import { useRef, useState, useEffect, type RefObject } from 'react';

export interface SwipeGestureOptions {
  /** Ref to the container element that receives touch events */
  containerRef: RefObject<HTMLElement | null>;
  /** Additional refs to attach swipe gestures to (e.g., content area) */
  additionalRefs?: RefObject<HTMLElement | null>[];
  /** Current active index */
  activeIndex: number;
  /** Total number of items */
  itemCount: number;
  /** Callback when swiping to next item (swipe left) */
  onNext: () => void;
  /** Callback when swiping to previous item (swipe right) */
  onPrev: () => void;
  /** Minimum swipe distance to trigger navigation (default: 50) */
  threshold?: number;
  /** Whether swipe is disabled */
  disabled?: boolean;
}

export interface SwipeGestureState {
  /** Current drag offset in pixels (positive = dragging right, negative = dragging left) */
  dragOffset: number;
  /** Whether user is currently dragging */
  isDragging: boolean;
}

/**
 * Hook for handling swipe gestures on touch devices.
 * Detects horizontal vs vertical scrolling and only captures horizontal swipes.
 *
 * @returns Drag state for animating the swipe effect
 */
/**
 * Check if an element or any of its ancestors is a horizontally scrollable container
 * that can actually scroll (has overflow content).
 */
function isWithinHorizontalScroller(element: HTMLElement | null): boolean {
  let el = element;
  while (el) {
    const style = getComputedStyle(el);
    const overflowX = style.overflowX;
    const isScrollable = overflowX === 'auto' || overflowX === 'scroll';
    const hasOverflow = el.scrollWidth > el.clientWidth;

    if (isScrollable && hasOverflow) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

export function useSwipeGesture({
  containerRef,
  additionalRefs = [],
  activeIndex,
  itemCount,
  onNext,
  onPrev,
  threshold = 50,
  disabled = false,
}: SwipeGestureOptions): SwipeGestureState {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const scrollDirection = useRef<'horizontal' | 'vertical' | null>(null);
  const isNestedScroller = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (disabled) return;

    // Collect all containers (main + additional)
    const containers: HTMLElement[] = [];
    if (containerRef.current) containers.push(containerRef.current);
    for (const ref of additionalRefs) {
      if (ref.current) containers.push(ref.current);
    }

    if (containers.length === 0) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      scrollDirection.current = null;
      // Check if touch started within a horizontally scrollable element
      isNestedScroller.current = isWithinHorizontalScroller(e.target as HTMLElement);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      // If touch started in a horizontally scrollable element, let it handle the scroll
      if (isNestedScroller.current) return;

      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;

      // Determine scroll direction on first significant movement
      if (scrollDirection.current === null) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (absX > 10 || absY > 10) {
          scrollDirection.current = absX > absY ? 'horizontal' : 'vertical';
          if (scrollDirection.current === 'horizontal') {
            setIsDragging(true);
          }
        }
      }

      // Only handle horizontal swipes, let vertical scroll through
      if (scrollDirection.current === 'horizontal') {
        e.preventDefault();
        // Stop propagation so parent swipe handlers (e.g., outer tabs wrapping inner tabs)
        // don't also respond to this gesture
        e.stopPropagation();
        setDragOffset(deltaX);
      }
    };

    const handleTouchEnd = () => {
      // Only trigger tab navigation if not within a nested scroller
      if (
        !isNestedScroller.current &&
        scrollDirection.current === 'horizontal' &&
        touchStartX.current !== null
      ) {
        if (dragOffset < -threshold && activeIndex < itemCount - 1) {
          onNext();
        } else if (dragOffset > threshold && activeIndex > 0) {
          onPrev();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
      scrollDirection.current = null;
      isNestedScroller.current = false;
      setDragOffset(0);
      setIsDragging(false);
    };

    // Attach listeners to all containers
    for (const container of containers) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      for (const container of containers) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [
    containerRef,
    additionalRefs,
    activeIndex,
    itemCount,
    dragOffset,
    onNext,
    onPrev,
    threshold,
    disabled,
  ]);

  return { dragOffset, isDragging };
}
