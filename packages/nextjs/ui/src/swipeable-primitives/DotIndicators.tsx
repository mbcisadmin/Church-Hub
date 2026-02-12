'use client';

import { motion } from 'framer-motion';

export interface DotIndicatorsProps {
  /** Total number of items */
  count: number;
  /** Index of the active item (0-based) */
  activeIndex: number;
  /** Callback when a dot is clicked */
  onSelect: (index: number) => void;
  /** Array of disabled indices */
  disabledIndices?: number[];
  /** Position of the dots relative to the container */
  position?: 'top' | 'bottom';
  /** Additional class names for the container */
  className?: string;
}

/**
 * Dot navigation indicators for swipeable components.
 * Active dot is wider and highlighted, others are small circles.
 * Uses Framer Motion layout animations for smooth transitions.
 */
export function DotIndicators({
  count,
  activeIndex,
  onSelect,
  disabledIndices = [],
  position = 'bottom',
  className = '',
}: DotIndicatorsProps) {
  const positionClass = position === 'top' ? 'top-2' : 'bottom-2';

  return (
    <div
      className={`absolute ${positionClass} left-1/2 flex -translate-x-1/2 gap-1.5 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => {
        const isDisabled = disabledIndices.includes(index);
        const isActive = index === activeIndex;

        return (
          <motion.button
            key={index}
            onClick={() => !isDisabled && onSelect(index)}
            disabled={isDisabled}
            className={`h-1.5 rounded-full ${
              isActive
                ? 'bg-primary'
                : isDisabled
                  ? 'bg-muted-foreground/20'
                  : 'bg-muted-foreground/40'
            }`}
            animate={{ width: isActive ? 16 : 6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            aria-label={`Go to item ${index + 1}`}
          />
        );
      })}
    </div>
  );
}
