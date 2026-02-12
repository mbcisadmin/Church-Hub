'use client';

import { useState, useRef, useCallback, type ReactNode, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface ExpandableCardProps {
  /** Preview content shown in the collapsed card */
  preview: ReactNode;
  /** Expanded content shown in the modal/sheet */
  expanded: ReactNode;
  /** Optional callback when card is expanded */
  onExpand?: () => void;
  /** Optional callback when card is collapsed */
  onCollapse?: () => void;
  /** Additional class names for the collapsed card */
  className?: string;
  /** Additional class names for the expanded panel */
  expandedClassName?: string;
  /** Custom expand indicator (shown on card, defaults to subtle scale hint) */
  expandIndicator?: ReactNode;
  /** Disable expand animation (just open sheet directly) */
  noAnimation?: boolean;
  /** Whether this card is disabled (won't expand on click) */
  disabled?: boolean;
}

/**
 * A card that expands into a modal-like view with a scale animation.
 * Creates a "coming closer to screen" effect when expanding.
 *
 * Features:
 * - Collapsed: Shows preview content with subtle expand hint
 * - Click: Card scales up slightly while fading into full modal
 * - Expanded: Shows full content in a centered modal with backdrop
 * - Click backdrop or X to close with reverse animation
 *
 * @example
 * ```tsx
 * <ExpandableCard
 *   preview={
 *     <div>
 *       <h3>Sunday Service</h3>
 *       <p>10:00 AM • Main Campus</p>
 *     </div>
 *   }
 *   expanded={
 *     <div>
 *       <h3>Sunday Service</h3>
 *       <p>Full event details...</p>
 *       <a href="/events/123">View Event</a>
 *     </div>
 *   }
 * />
 * ```
 */
export function ExpandableCard({
  preview,
  expanded,
  onExpand,
  onCollapse,
  className = '',
  expandedClassName = '',
  expandIndicator,
  noAnimation = false,
  disabled = false,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExpand = useCallback(
    (e: MouseEvent) => {
      if (disabled) return;

      // Capture card position for animation origin
      if (cardRef.current && !noAnimation) {
        setCardRect(cardRef.current.getBoundingClientRect());
      }

      setIsExpanded(true);
      onExpand?.();

      // Prevent event from bubbling (e.g., if card is inside a link)
      e.stopPropagation();
    },
    [disabled, noAnimation, onExpand]
  );

  const handleCollapse = useCallback(() => {
    setIsExpanded(false);
    onCollapse?.();

    // Clear rect after animation completes
    setTimeout(() => setCardRect(null), 300);
  }, [onCollapse]);

  // Lock body scroll when expanded
  const handleBackdropClick = useCallback(
    (e: MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleCollapse();
      }
    },
    [handleCollapse]
  );

  // Calculate origin transform for animation
  const getOriginStyle = () => {
    if (!cardRect || noAnimation) return {};

    const centerX = cardRect.left + cardRect.width / 2;
    const centerY = cardRect.top + cardRect.height / 2;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    return {
      originX: centerX / window.innerWidth,
      originY: centerY / window.innerHeight,
      offsetX: centerX - viewportCenterX,
      offsetY: centerY - viewportCenterY,
    };
  };

  const origin = getOriginStyle();

  return (
    <>
      {/* Collapsed Card */}
      <motion.div
        ref={cardRef}
        onClick={handleExpand}
        className={`group relative cursor-pointer ${disabled ? 'cursor-default' : ''} ${className}`}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {preview}

        {/* Expand indicator - subtle visual hint */}
        {!disabled && (
          <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100">
            {expandIndicator || (
              <div className="ring-primary/20 absolute inset-0 rounded-lg ring-2" />
            )}
          </div>
        )}
      </motion.div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleBackdropClick}
            />

            {/* Expanded Panel */}
            <motion.div
              initial={
                noAnimation
                  ? { opacity: 0, scale: 0.95 }
                  : {
                      opacity: 0,
                      scale: 0.8,
                      x: origin.offsetX,
                      y: origin.offsetY,
                    }
              }
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
              }}
              exit={
                noAnimation
                  ? { opacity: 0, scale: 0.95 }
                  : {
                      opacity: 0,
                      scale: 0.8,
                      x: origin.offsetX,
                      y: origin.offsetY,
                    }
              }
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className={`bg-card relative z-10 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl shadow-2xl ${expandedClassName}`}
            >
              {/* Close button */}
              <button
                onClick={handleCollapse}
                className="absolute top-3 right-3 z-10 rounded-full bg-black/20 p-1.5 text-white/70 transition-colors hover:bg-black/40 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Expanded content */}
              {expanded}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
