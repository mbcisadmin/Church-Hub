'use client';

import { ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface SwipeIndicatorsProps {
  /** Whether the left indicator should be interactive */
  canGoLeft: boolean;
  /** Whether the right indicator should be interactive */
  canGoRight: boolean;
  /** Callback when left indicator is clicked */
  onLeft: () => void;
  /** Callback when right indicator is clicked */
  onRight: () => void;
  /** Bottom offset in rem (positive = up from bottom, negative = below container). Default: 1 */
  bottomOffset?: number;
  /** Additional class names for both indicators */
  className?: string;
}

/**
 * Animated chevron indicators for swipeable components.
 * Shows left/right navigation hints with pulse animations.
 */
export function SwipeIndicators({
  canGoLeft,
  canGoRight,
  onLeft,
  onRight,
  bottomOffset = 1,
  className = '',
}: SwipeIndicatorsProps) {
  const bottomStyle = { bottom: `${bottomOffset}rem` };

  return (
    <>
      {/* Left chevron indicator */}
      <button
        onClick={() => canGoLeft && onLeft()}
        className={`absolute -left-1 z-20 p-2 transition-opacity duration-300 ${
          canGoLeft ? 'text-muted-foreground/25' : 'pointer-events-none opacity-0'
        } ${className}`}
        style={bottomStyle}
        aria-label="Previous"
      >
        <ChevronsLeft
          className="h-6 w-6"
          style={{ animation: 'swipeIndicator-left 2s ease-in-out infinite' }}
        />
      </button>

      {/* Right chevron indicator */}
      <button
        onClick={() => canGoRight && onRight()}
        className={`absolute -right-1 z-20 p-2 transition-opacity duration-300 ${
          canGoRight ? 'text-muted-foreground/25' : 'pointer-events-none opacity-0'
        } ${className}`}
        style={bottomStyle}
        aria-label="Next"
      >
        <ChevronsRight
          className="h-6 w-6"
          style={{ animation: 'swipeIndicator-right 2s ease-in-out infinite' }}
        />
      </button>

      {/* Keyframe animations */}
      <style>
        {`
          @keyframes swipeIndicator-left {
            0%, 100% { transform: translateX(0); opacity: 0.4; }
            50% { transform: translateX(-4px); opacity: 0.8; }
          }
          @keyframes swipeIndicator-right {
            0%, 100% { transform: translateX(0); opacity: 0.4; }
            50% { transform: translateX(4px); opacity: 0.8; }
          }
        `}
      </style>
    </>
  );
}
