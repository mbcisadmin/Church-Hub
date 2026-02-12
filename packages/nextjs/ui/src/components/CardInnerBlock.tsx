'use client';

import { cn } from '../lib/utils';

export interface CardInnerBlockProps {
  /** Block content */
  children: React.ReactNode;
  /** Shape variant */
  shape?: 'square' | 'circle';
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Inner block component for cards (date blocks, avatars, stat displays).
 * Provides consistent styling with border and shadow that can be themed.
 *
 * Uses CSS variables for theming:
 * - --card-inner-border: border color (defaults to --border)
 * - --card-inner-shadow: shadow color (defaults to subtle shadow)
 *
 * @example
 * ```tsx
 * <CardInnerBlock shape="square">
 *   <span>21</span>
 * </CardInnerBlock>
 *
 * <CardInnerBlock shape="circle">
 *   <img src={avatar} />
 * </CardInnerBlock>
 * ```
 */
export function CardInnerBlock({ children, shape = 'square', className }: CardInnerBlockProps) {
  return (
    <div
      className={cn(
        // Base styles
        'relative z-10 mb-2 flex h-14 w-14 items-center justify-center overflow-hidden',
        // Background
        'bg-background',
        // Border - uses CSS var with fallback
        'border border-[var(--card-inner-border,var(--border))]',
        // Shadow - uses CSS var with fallback
        'shadow-[0_1px_2px_var(--card-inner-shadow,rgba(0,0,0,0.05))]',
        // Shape
        shape === 'circle' ? 'rounded-full' : 'rounded-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
