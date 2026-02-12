'use client';

import { motion } from 'framer-motion';

export interface AppCardProps {
  /** App name */
  name: string;
  /** App description */
  description?: string;
  /** Icon component for watermark */
  icon?: React.ComponentType<{ className?: string }>;
  /** Click handler */
  onClick: () => void;
}

/**
 * Card for displaying an app/tool in a grid.
 * Shows name, description, and optional watermark icon.
 *
 * @example
 * ```tsx
 * <AppCard
 *   name="Calendar"
 *   description="View and manage all events"
 *   icon={Calendar}
 *   onClick={() => router.push('/events/calendar')}
 * />
 * ```
 */
export function AppCard({ name, description, icon: Icon, onClick }: AppCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-muted/55 hover:bg-muted/65 relative flex h-32 w-full flex-col items-start justify-end overflow-hidden p-4 shadow-sm transition-shadow duration-200 hover:shadow-md focus:outline-none"
    >
      {/* Watermark icon */}
      {Icon && <Icon className="text-watermark absolute top-2 right-2 h-16 w-16" />}

      <div className="relative z-10">
        <p className="text-foreground text-sm font-bold tracking-wide uppercase">{name}</p>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
    </motion.button>
  );
}
