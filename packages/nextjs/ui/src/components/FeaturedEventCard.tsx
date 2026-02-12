'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { CardActionsContainer, type CardAction } from './CardActions';

export interface FeaturedEventCardProps {
  /** Event title */
  title: string;
  /** Background image URL */
  imageUrl: string;
  /** Date range display (e.g., "Feb 21-23, 2026") */
  dateRange: string;
  /** Optional badge text (e.g., "Retreat", "Conference") */
  badge?: string;
  /** Optional subtitle (e.g., location) */
  subtitle?: string;
  /** Click handler */
  onClick: () => void;
  /** Optional className for custom styling */
  className?: string;
  /** Optional action buttons that appear on hover */
  actions?: CardAction[];
}

/**
 * A wider, image-based card for featured/special events.
 * Uses a background image with gradient overlay and white text.
 * Standalone component (does not extend BaseCard due to different dimensions).
 *
 * @example
 * ```tsx
 * <FeaturedEventCard
 *   title="Winter Retreat 2026"
 *   imageUrl="/images/retreat.jpg"
 *   dateRange="Feb 21-23, 2026"
 *   badge="Retreat"
 *   subtitle="Camp Barakel"
 *   onClick={() => router.push('/events/456')}
 * />
 * ```
 */
export function FeaturedEventCard({
  title,
  imageUrl,
  dateRange,
  badge,
  subtitle,
  onClick,
  className,
  actions,
}: FeaturedEventCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const showActions = isHovered || isFocused;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        'relative flex h-48 w-72 flex-shrink-0 flex-col overflow-hidden text-left shadow-md transition-shadow duration-200 hover:shadow-lg focus:outline-none',
        className
      )}
    >
      {/* Background image */}
      <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Action buttons */}
      {actions && actions.length > 0 && (
        <CardActionsContainer actions={actions} visible={showActions} position="top-right" />
      )}

      {/* Badge pill */}
      {badge && (
        <div className="relative z-10 p-3 pb-0">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-sm">
            {badge}
          </span>
        </div>
      )}

      {/* Bottom content */}
      <div className="relative z-10 mt-auto p-3">
        <h3 className="line-clamp-2 text-sm leading-tight font-bold tracking-wide text-white uppercase">
          {title}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[11px] text-white/80">{dateRange}</span>
          {subtitle && (
            <>
              <span className="text-[11px] text-white/50">&middot;</span>
              <span className="text-[11px] text-white/80">{subtitle}</span>
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
}
