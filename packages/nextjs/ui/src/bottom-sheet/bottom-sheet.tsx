'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

/**
 * Z-index scale for UI overlays:
 * - z-10: Footer (static, relative positioned)
 * - z-40-45: SimulationBanner, alerts
 * - z-50: Header (fixed), modals, sidebars
 * - z-60: BottomSheet (above header for proper overlay)
 * - z-70+: Tooltips, urgent overlays (reserved)
 */

interface BottomSheetProps {
  /** Whether the bottom sheet is open */
  open: boolean;
  /** Callback when the sheet should close */
  onClose: () => void;
  /** Content to render inside the sheet (scrollable) */
  children: ReactNode;
  /** Optional header content rendered in the sticky drag area (non-scrollable) */
  header?: ReactNode;
  /** Additional class names for the sheet panel */
  className?: string;
  /** Distance threshold in pixels to close when released (default: 100) */
  closeThreshold?: number;
  /** Velocity threshold (px/ms) to close regardless of distance (default: 0.5) */
  velocityThreshold?: number;
  /** Hide the default swipe handle (useful when rendering custom handle in content) */
  hideHandle?: boolean;
  /** Maximum height of the sheet (default: '90dvh') */
  maxHeight?: string;
  /** Z-index class override (default: 'z-[60]') */
  zIndex?: string;
  /** Show scroll indicator when content is scrollable (default: true) */
  showScrollIndicator?: boolean;
  /** Use light theme for scroll indicator (for light content backgrounds) */
  lightScrollIndicator?: boolean;
}

/**
 * A mobile-friendly bottom sheet component with drag-to-close functionality.
 *
 * Features:
 * - Slides up from bottom
 * - Drag down on handle/header area to close (follows finger, Instagram-style)
 * - Velocity-based close detection (flick to dismiss)
 * - Snaps back if not dragged far enough
 * - Tap backdrop to close
 * - Escape key to close
 * - Prevents body scroll when open (content inside can still scroll)
 * - Rounded top corners with swipe handle indicator
 * - Optional sticky header in drag area
 */
export function BottomSheet({
  open,
  onClose,
  children,
  header,
  className = '',
  closeThreshold = 100,
  velocityThreshold = 0.5,
  hideHandle = false,
  maxHeight = '90dvh',
  zIndex = 'z-[60]',
  showScrollIndicator = true,
  lightScrollIndicator = false,
}: BottomSheetProps) {
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if content is scrollable and update indicator
  const checkScrollIndicator = useCallback(() => {
    if (!showScrollIndicator) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const hasMoreContent = container.scrollHeight > container.clientHeight + 5;
    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 20;

    setShowIndicator(hasMoreContent && !isAtBottom);
  }, [showScrollIndicator]);

  // Set up scroll indicator tracking
  useEffect(() => {
    if (!showScrollIndicator || !open) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Check initially and after delays for content rendering
    checkScrollIndicator();
    const timeouts = [
      setTimeout(checkScrollIndicator, 50),
      setTimeout(checkScrollIndicator, 150),
      setTimeout(checkScrollIndicator, 300),
    ];

    container.addEventListener('scroll', checkScrollIndicator);
    window.addEventListener('resize', checkScrollIndicator);

    const resizeObserver = new ResizeObserver(checkScrollIndicator);
    resizeObserver.observe(container);
    if (container.firstElementChild) {
      resizeObserver.observe(container.firstElementChild);
    }

    return () => {
      timeouts.forEach(clearTimeout);
      container.removeEventListener('scroll', checkScrollIndicator);
      window.removeEventListener('resize', checkScrollIndicator);
      resizeObserver.disconnect();
    };
  }, [open, showScrollIndicator, checkScrollIndicator]);

  // Reset drag offset when sheet closes
  useEffect(() => {
    if (!open) {
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [open]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Store current scroll position
      const scrollY = window.scrollY;
      // Lock both html and body (needed for iOS Safari)
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      const scrollY = document.body.style.top;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    };
  }, [open, onClose]);

  // Prevent scroll propagation at content boundaries (iOS Safari fix).
  // overscroll-contain alone doesn't reliably prevent scroll-through on iOS,
  // so we manually block touchmove when at the top/bottom of the scroll area.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !open) return;

    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const deltaY = e.touches[0].clientY - startY;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      // Block scroll-through when at boundaries or content doesn't overflow
      if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
    };
  }, [open]);

  // Native touch event listeners for drag-to-close (on drag area: handle + header)
  useEffect(() => {
    const dragArea = dragAreaRef.current;
    if (!dragArea || !open) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default only on drag area to allow content scrolling
      e.preventDefault();
      if (touchStartY.current === null) return;

      const deltaY = e.touches[0].clientY - touchStartY.current;
      // Only allow dragging down (positive deltaY), clamp at 0
      setDragOffset(Math.max(0, deltaY));
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null || touchStartTime.current === null) {
        setIsDragging(false);
        return;
      }

      const endY = e.changedTouches[0].clientY;
      const deltaY = endY - touchStartY.current;
      const deltaTime = Date.now() - touchStartTime.current;
      const velocity = deltaTime > 0 ? deltaY / deltaTime : 0; // px per ms

      // Close if dragged past threshold OR flicked with enough velocity
      if (deltaY > closeThreshold || velocity > velocityThreshold) {
        onClose();
      } else {
        // Snap back
        setDragOffset(0);
      }

      touchStartY.current = null;
      touchStartTime.current = null;
      setIsDragging(false);
    };

    dragArea.addEventListener('touchstart', handleTouchStart, { passive: true });
    dragArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    dragArea.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      dragArea.removeEventListener('touchstart', handleTouchStart);
      dragArea.removeEventListener('touchmove', handleTouchMove);
      dragArea.removeEventListener('touchend', handleTouchEnd);
    };
  }, [open, onClose, closeThreshold, velocityThreshold]);

  // Calculate transform based on open state and drag
  const panelTransform = open ? `translateY(${dragOffset}px)` : 'translateY(100%)';

  if (!mounted) return null;

  // Portal to document.body so the sheet escapes any parent stacking context
  // (e.g. the header wrapper's z-50) and z-[60] works against the root.
  return createPortal(
    <div
      className={`fixed inset-0 ${zIndex} transition-opacity duration-300 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* Backdrop - very subtle since sheet appears immediately */}
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ touchAction: 'none' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col rounded-t-[2rem] shadow-2xl ${
          isDragging ? '' : 'transition-transform duration-300 ease-out'
        } ${className}`}
        style={{ transform: panelTransform, maxHeight, overscrollBehavior: 'contain' }}
      >
        {/* Drag area: handle + optional header - pulling here closes the sheet */}
        <div ref={dragAreaRef} className="shrink-0 cursor-grab">
          {/* Swipe handle indicator */}
          {!hideHandle && (
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1.5 w-14 rounded-full bg-black/30 dark:bg-gray-400" />
            </div>
          )}

          {/* Optional sticky header */}
          {header}
        </div>

        {/* Scrollable content area */}
        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Scroll indicator */}
        <AnimatePresence>
          {showIndicator && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-none absolute right-0 bottom-0 left-0 flex h-20 items-end justify-center ${
                lightScrollIndicator
                  ? 'bg-gradient-to-t from-[var(--card)] to-transparent'
                  : 'bg-gradient-to-t from-[#0b0d0c] to-transparent'
              }`}
            >
              <div
                className={`mb-3 flex flex-col items-center gap-1 ${
                  lightScrollIndicator ? 'text-muted-foreground' : 'text-white/50'
                }`}
              >
                <span className="text-xs font-medium tracking-wide uppercase">Scroll for more</span>
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ChevronLeft className="h-4 w-4 -rotate-90" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
}
