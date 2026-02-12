'use client';

import { ChevronRight } from 'lucide-react';
import { useEffect, useState, useId } from 'react';

/** Available icon animation types */
export type IconAnimation = 'tilt' | 'shake' | 'bounce' | 'pulse' | 'wiggle' | 'poke';

/** How often the animation should trigger */
export type AnimationFrequency = 'rare' | 'occasional' | 'frequent';

export interface SectionTitleProps {
  /** Icon component (must accept className and style props) */
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** Section title */
  title: string;
  /** Section subtitle/description */
  subtitle: string;
  /** Optional action button text */
  action?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Optional animation for the icon */
  iconAnimation?: IconAnimation;
  /** How often the animation triggers (default: 'occasional') */
  animationFrequency?: AnimationFrequency;
}

/** Animation keyframes for each type */
const animationKeyframes: Record<IconAnimation, string> = {
  tilt: `
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-15deg); }
    75% { transform: rotate(15deg); }
  `,
  shake: `
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-0.5px); }
    50% { transform: translateX(0.5px); }
    75% { transform: translateX(-0.5px); }
  `,
  bounce: `
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  `,
  pulse: `
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  `,
  wiggle: `
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-8deg); }
    50% { transform: rotate(8deg); }
    75% { transform: rotate(-4deg); }
  `,
  poke: `
    0% { transform: translateY(0) rotate(0deg); }
    15% { transform: translateY(-4px) rotate(0deg); }
    30% { transform: translateY(-4px) rotate(15deg); }
    45% { transform: translateY(-3px) rotate(-8deg); }
    55% { transform: translateY(-2px) rotate(0deg); }
    70% { transform: translateY(2px) rotate(0deg); }
    85% { transform: translateY(-1px) rotate(0deg); }
    100% { transform: translateY(0) rotate(0deg); }
  `,
};

/** Animation duration in ms for each type */
const animationDuration: Record<IconAnimation, number> = {
  tilt: 400,
  shake: 300,
  bounce: 250,
  pulse: 400,
  wiggle: 500,
  poke: 600,
};

/** Interval ranges in ms for each frequency */
const frequencyRanges: Record<AnimationFrequency, [number, number]> = {
  rare: [15000, 30000],
  occasional: [6000, 12000],
  frequent: [3000, 6000],
};

/** Get a random interval within the frequency range */
function getRandomInterval(frequency: AnimationFrequency): number {
  const [min, max] = frequencyRanges[frequency];
  return Math.random() * (max - min) + min;
}

/**
 * Section title with inline icon and connecting line.
 * The line and icon align with the subtitle's width.
 * Used for labeling content sections on category and home pages.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SectionTitle
 *   icon={Pin}
 *   title="Pinned"
 *   subtitle="Your favorite items"
 *   action="View all"
 *   onAction={() => router.push('/pinned')}
 * />
 *
 * // With animated icon
 * <SectionTitle
 *   icon={Pin}
 *   title="Pinned"
 *   subtitle="Your favorite items"
 *   iconAnimation="tilt"
 *   animationFrequency="occasional"
 * />
 * ```
 */
export function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  action,
  onAction,
  iconAnimation,
  animationFrequency = 'occasional',
}: SectionTitleProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationId = useId();

  useEffect(() => {
    if (!iconAnimation) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextAnimation = () => {
      const delay = getRandomInterval(animationFrequency);
      timeoutId = setTimeout(() => {
        setIsAnimating(true);
        // Turn off animation after it completes
        setTimeout(() => {
          setIsAnimating(false);
          scheduleNextAnimation();
        }, animationDuration[iconAnimation]);
      }, delay);
    };

    // Start the animation cycle with an initial random delay
    // (so multiple instances don't all start at the same time)
    const initialDelay = Math.random() * frequencyRanges[animationFrequency][0];
    timeoutId = setTimeout(scheduleNextAnimation, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [iconAnimation, animationFrequency]);

  return (
    <div className="mb-4 flex items-end justify-between">
      {/* Inject keyframes for this specific animation */}
      {iconAnimation && (
        <style>
          {`
            @keyframes section-title-icon-${animationId.replace(/:/g, '')} {
              ${animationKeyframes[iconAnimation]}
            }
          `}
        </style>
      )}

      {/* Left side: title + line + icon, constrained to subtitle width */}
      <div className="inline-flex flex-col">
        {/* Title row with line and icon */}
        <div className="flex items-center gap-3">
          <h3 className="text-foreground text-base font-bold tracking-tight uppercase">{title}</h3>
          {/* Connecting line - same color as heading */}
          <div className="bg-foreground h-[2px] flex-1" />
          {/* Inline icon with optional animation */}
          <Icon
            className="text-foreground h-4 w-4 flex-shrink-0"
            style={
              iconAnimation && isAnimating
                ? {
                    animation: `section-title-icon-${animationId.replace(/:/g, '')} ${animationDuration[iconAnimation]}ms ease-in-out`,
                  }
                : undefined
            }
          />
        </div>

        {/* Subtitle with left padding - matches SectionHeader subtitle style */}
        <p className="text-muted-foreground pl-6 text-xs font-normal tracking-widest uppercase">
          {subtitle}
        </p>
      </div>

      {/* Action button on the right */}
      {action && onAction && (
        <button
          onClick={onAction}
          className="group/action text-muted-foreground hover:text-foreground flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase transition-colors hover:bg-transparent"
        >
          {action}
          <ChevronRight className="h-3 w-3 transition-transform group-hover/action:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}
