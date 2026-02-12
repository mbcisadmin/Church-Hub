'use client';

import { type ReactNode, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';

export interface FloatingFilterFabProps {
  /** Whether the filter sheet is currently open */
  isOpen: boolean;
  /** Callback when the FAB is clicked */
  onClick: () => void;
  /** Number of active filters (shown as badge) */
  activeCount?: number;
  /** Custom icon to display (defaults to SlidersHorizontal) */
  icon?: ReactNode;
  /** CSS gradient or color for the FAB button */
  buttonGradient?: string;
  /** Background color for the half-circle (solid color recommended) */
  backgroundColor?: string;
  /** Aria label for accessibility */
  ariaLabel?: string;
  /** Additional class name for the container */
  className?: string;
  /** Whether the FAB should be visible (use for tab switching animations) */
  visible?: boolean;
  /** CSS selector for an element to stop above (e.g., 'footer'). FAB will not overlap this element. */
  stopAtSelector?: string;
}

/**
 * A floating action button for filters with a half-circle background.
 *
 * @deprecated Use `PeekSheet` from `@church/nextjs-ui/peek-sheet` instead.
 * PeekSheet combines the trigger and sheet into a single component with
 * a peek-from-bottom pattern on mobile and inline trigger + modal on desktop.
 *
 * Features:
 * - Half-circle colored background that sticks to the bottom
 * - Smooth entrance/exit animations (also works with tab switching)
 * - Badge for showing active filter count
 * - Customizable colors and icon
 * - Renders via Portal to avoid being affected by parent visibility
 *
 * @example
 * ```tsx
 * <FloatingFilterFab
 *   isOpen={sheetOpen}
 *   onClick={() => setSheetOpen(true)}
 *   activeCount={3}
 *   visible={activeTab === 'current'}
 *   buttonGradient="linear-gradient(135deg, #aad43c 0%, #8bc34a 100%)"
 *   backgroundColor="#1e2320"
 * />
 * ```
 */
export function FloatingFilterFab({
  isOpen,
  onClick,
  activeCount = 0,
  icon,
  buttonGradient = 'linear-gradient(135deg, #aad43c 0%, #8bc34a 100%)',
  backgroundColor = '#1e2320',
  ariaLabel = 'Open filters',
  className = '',
  visible = true,
  stopAtSelector,
}: FloatingFilterFabProps) {
  const [mounted, setMounted] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(0);

  // Only render portal after mount (for SSR compatibility)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track scroll position relative to the stop element
  const updatePosition = useCallback(() => {
    if (!stopAtSelector) return;

    const stopElement = document.querySelector(stopAtSelector);
    if (!stopElement) return;

    const rect = stopElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // If the stop element is visible in the viewport
    if (rect.top < viewportHeight) {
      // Calculate how much the FAB needs to be pushed up
      // Subtract a small amount so it tucks slightly behind the stop element
      const overlap = viewportHeight - rect.top - 8;
      setBottomOffset(Math.max(0, overlap));
    } else {
      setBottomOffset(0);
    }
  }, [stopAtSelector]);

  // Set up scroll listener for the stop element behavior
  useEffect(() => {
    if (!mounted || !stopAtSelector) return;

    // Find the scroll container (MainScrollContainer uses absolute positioning)
    // Look for the scrolling element that contains the stop element
    const stopElement = document.querySelector(stopAtSelector);
    if (!stopElement) return;

    // Find the scrolling ancestor
    let scrollContainer: Element | Window = window;
    let parent = stopElement.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        scrollContainer = parent;
        break;
      }
      parent = parent.parentElement;
    }

    // Initial position check
    updatePosition();

    // Listen for scroll events
    scrollContainer.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [mounted, stopAtSelector, updatePosition]);

  const shouldShow = visible && !isOpen;

  const content = (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: 'tween',
            duration: 0.3,
            ease: 'easeOut',
          }}
          className={`fixed left-1/2 z-40 -translate-x-1/2 ${className}`}
          style={{ bottom: bottomOffset }}
        >
          {/* Pull tab background - like a mini bottom sheet handle */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: '280px',
              height: '56px',
              background: backgroundColor,
              borderRadius: '24px 24px 0 0',
            }}
          />

          {/* FAB Button */}
          <motion.button
            onClick={onClick}
            className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
            style={{
              background: buttonGradient,
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 4px 16px rgba(170, 212, 60, 0.3), 0 6px 20px rgba(0, 0, 0, 0.15)',
                '0 6px 24px rgba(170, 212, 60, 0.45), 0 8px 28px rgba(0, 0, 0, 0.2)',
                '0 4px 16px rgba(170, 212, 60, 0.3), 0 6px 20px rgba(0, 0, 0, 0.15)',
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            aria-label={ariaLabel}
          >
            {icon ?? <SlidersHorizontal className="h-7 w-7 text-white" />}

            {/* Active filter count badge */}
            <AnimatePresence>
              {activeCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 25,
                  }}
                  className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-900 shadow"
                >
                  {activeCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render via portal to escape any parent visibility constraints
  if (!mounted) return null;
  return createPortal(content, document.body);
}
