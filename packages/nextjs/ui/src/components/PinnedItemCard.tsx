'use client';

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export interface PinnedItemCardProps {
  /** Category label shown above the main label */
  category?: string;
  /** Main label for the pinned item */
  label: string;
  /** Optional watermark icon - omit for cleaner look when context is clear */
  icon?: React.ComponentType<{ className?: string }>;
  /** Whether to show the delete/unpin button on hover */
  showDelete?: boolean;
  /** Click handler */
  onClick: () => void;
  /** Delete handler */
  onDelete?: () => void;
}

/**
 * Circular card for pinned/favorite items.
 * Used on home page and category pages for quick access shortcuts.
 *
 * @example
 * ```tsx
 * // With category and watermark (home page style)
 * <PinnedItemCard
 *   category="Events"
 *   label="Winter Retreat"
 *   icon={Calendar}
 *   showDelete
 *   onClick={() => router.push('/events/123')}
 * />
 *
 * // Without watermark (category page style - context is clear)
 * <PinnedItemCard
 *   label="Winter Retreat"
 *   onClick={() => router.push('/events/123')}
 * />
 * ```
 */
export function PinnedItemCard({
  category,
  label,
  icon: Icon,
  showDelete = false,
  onClick,
  onDelete,
}: PinnedItemCardProps) {
  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="group bg-muted/55 hover:bg-muted/65 relative flex h-36 w-36 flex-shrink-0 flex-col items-center justify-center rounded-full p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg focus:outline-none"
    >
      {/* Delete/unpin button on hover */}
      {showDelete && onDelete && (
        <div
          className="absolute top-1 right-1 z-20 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <div className="bg-muted hover:bg-destructive/20 flex h-7 w-7 items-center justify-center rounded-full shadow-sm">
            <Trash2 className="text-muted-foreground hover:text-destructive h-3.5 w-3.5" />
          </div>
        </div>
      )}

      {/* Watermark icon - only shown if provided */}
      {Icon && <Icon className="text-muted-foreground/5 absolute right-4 bottom-4 h-20 w-20" />}

      {/* Content */}
      <div className="relative z-10 text-center">
        {category && (
          <p className="text-muted-foreground/70 text-[10px] font-medium tracking-wide uppercase">
            {category}
          </p>
        )}
        <p className="text-muted-foreground text-sm leading-tight font-bold tracking-wide uppercase">
          {label}
        </p>
      </div>
    </motion.button>
  );
}
