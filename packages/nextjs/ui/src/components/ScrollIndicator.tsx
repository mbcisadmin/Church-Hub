'use client';

import { useState, useEffect, useCallback, useRef, type RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface ScrollIndicatorProps {
  /** Ref to the scrollable container to monitor */
  containerRef: RefObject<HTMLElement | null>;
  /** Optional ref to the content boundary element. When provided, the indicator
   *  hides when this element's bottom is visible (e.g., to stop before a footer). */
  contentRef?: RefObject<HTMLElement | null>;
  /** Visual variant - 'light' for light backgrounds, 'dark' for dark backgrounds */
  variant?: 'light' | 'dark';
  /** Custom gradient background class (overrides variant) */
  gradientClass?: string;
  /** Whether the indicator should be active (e.g., when parent is open) */
  active?: boolean;
  /** Condensed mode - just shows animated chevron, no text */
  condensed?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * A scroll indicator that shows "Scroll for more" with an animated chevron
 * when there's more content to scroll. Automatically hides when user scrolls
 * to the bottom or when content fits without scrolling.
 *
 * @example
 * ```tsx
 * const scrollRef = useRef<HTMLDivElement>(null);
 *
 * <div ref={scrollRef} className="overflow-y-auto">
 *   {content}
 * </div>
 * <ScrollIndicator containerRef={scrollRef} variant="dark" active={isOpen} />
 * ```
 */
export function ScrollIndicator({
  containerRef,
  contentRef,
  variant = 'light',
  gradientClass,
  active = true,
  condensed = false,
  className = '',
}: ScrollIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);

  const checkScrollIndicator = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // When a contentRef is provided, use its bottom edge as the boundary
    // instead of the scroll container's full scrollHeight. This lets the
    // indicator hide when the content area ends (e.g., before a footer).
    if (contentRef?.current) {
      const contentRect = contentRef.current.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const contentBelowFold = contentRect.bottom > containerRect.bottom + 20;
      setShowIndicator(contentBelowFold);
      return;
    }

    // Use a larger threshold (20px) to avoid false positives from padding/margins
    const hasMoreContent = container.scrollHeight > container.clientHeight + 20;
    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 20;

    setShowIndicator(hasMoreContent && !isAtBottom);
  }, [containerRef, contentRef]);

  useEffect(() => {
    if (!active) {
      setShowIndicator(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Check initially
    checkScrollIndicator();

    // Check after delays to account for content rendering and animations
    const timeouts = [
      setTimeout(checkScrollIndicator, 50),
      setTimeout(checkScrollIndicator, 150),
      setTimeout(checkScrollIndicator, 300),
      setTimeout(checkScrollIndicator, 500), // Extra check for longer animations
    ];

    // Listen for scroll events
    container.addEventListener('scroll', checkScrollIndicator);
    window.addEventListener('resize', checkScrollIndicator);

    // Use ResizeObserver to detect content size changes
    const resizeObserver = new ResizeObserver(checkScrollIndicator);
    resizeObserver.observe(container);
    if (container.firstElementChild) {
      resizeObserver.observe(container.firstElementChild);
    }

    // Use MutationObserver to catch DOM changes (sections expanding/collapsing)
    const mutationObserver = new MutationObserver(() => {
      // Debounce slightly to let animations settle
      setTimeout(checkScrollIndicator, 50);
    });
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      timeouts.forEach(clearTimeout);
      container.removeEventListener('scroll', checkScrollIndicator);
      window.removeEventListener('resize', checkScrollIndicator);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [active, checkScrollIndicator, containerRef]);

  // Determine colors based on variant
  const defaultGradient =
    variant === 'dark'
      ? 'bg-gradient-to-t from-[#1a1d1c] to-transparent'
      : 'bg-gradient-to-t from-[var(--card)] to-transparent';

  const textColor = variant === 'dark' ? 'text-white/50' : 'text-muted-foreground';

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`pointer-events-none absolute right-2 bottom-0 left-0 z-10 flex items-end justify-center ${condensed ? 'h-10' : 'h-16'} ${gradientClass || defaultGradient} ${className}`}
        >
          <div className={`mb-2 flex flex-col items-center gap-0.5 ${textColor}`}>
            {!condensed && (
              <span className="text-[10px] font-medium tracking-wider uppercase">
                Scroll for more
              </span>
            )}
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className={condensed ? 'h-4 w-4' : 'h-3 w-3'} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
