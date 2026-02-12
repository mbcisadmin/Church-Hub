'use client';

import { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';
import { CardActionsContainer, type CardAction } from './CardActions';

export interface BaseCardProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  /** Card content */
  children: React.ReactNode;
  /** Optional className for custom styling */
  className?: string;
  /** Optional shadow color for colored cards (e.g., 'rgba(239, 68, 68, 0.3)') */
  shadowColor?: string;
  /** Optional action buttons that appear on hover */
  actions?: CardAction[];
  /** Position of action buttons (default: 'top-right') */
  actionsPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Base card component with shared styles for all card types.
 * Provides consistent sizing, borders, shadows, and hover behavior.
 *
 * @example
 * ```tsx
 * <BaseCard onClick={handleClick} className="bg-red-100">
 *   <p>Card content</p>
 * </BaseCard>
 *
 * // With actions
 * <BaseCard
 *   onClick={handleClick}
 *   actions={[createUnpinAction(() => handleUnpin())]}
 * >
 *   <p>Pinned card</p>
 * </BaseCard>
 * ```
 */
export function BaseCard({
  children,
  className,
  shadowColor,
  style,
  actions,
  actionsPosition = 'top-right',
  ...props
}: BaseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const showActions = isHovered || isFocused;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        // Base styles
        'group relative flex h-40 w-32 flex-shrink-0 flex-col items-center overflow-visible border p-3 transition-shadow duration-200 focus:outline-none',
        // Default colors (can be overridden)
        'bg-card border-border',
        // Shadows
        'shadow-md hover:shadow-lg',
        // Opt out of global button hover styles
        'hover:bg-card',
        className
      )}
      style={{
        ...(shadowColor && {
          boxShadow: `0 4px 6px -1px ${shadowColor}, 0 2px 4px -2px ${shadowColor}`,
        }),
        ...style,
      }}
      {...props}
    >
      {/* Action buttons */}
      {actions && actions.length > 0 && (
        <CardActionsContainer actions={actions} visible={showActions} position={actionsPosition} />
      )}
      {children}
    </motion.button>
  );
}
