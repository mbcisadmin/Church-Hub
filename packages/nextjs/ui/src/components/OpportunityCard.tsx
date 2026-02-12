'use client';

import { motion } from 'framer-motion';

export interface OpportunityCardProps {
  /** Opportunity title */
  title: string;
  /** Subtitle (e.g., team name) */
  subtitle?: string;
  /** Detail text (e.g., "3 spots needed") */
  detail?: string;
  /** Secondary detail (e.g., date/time) */
  secondaryDetail?: string;
  /** Urgency level affecting card styling */
  urgency?: 'high' | 'medium' | 'low';
  /** Click handler */
  onClick: () => void;
}

const urgencyStyles = {
  high: {
    bg: 'bg-destructive/15 hover:bg-destructive/20',
    badge: 'bg-destructive/20 text-destructive',
  },
  medium: {
    bg: 'bg-amber-500/15 hover:bg-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-600',
  },
  low: {
    bg: 'bg-muted hover:bg-muted/80',
    badge: 'bg-muted-foreground/20 text-muted-foreground',
  },
};

/**
 * Card for displaying serving/volunteer opportunities.
 * Supports urgency-based styling (high = red, medium = amber, low = muted).
 *
 * @example
 * ```tsx
 * <OpportunityCard
 *   title="Nursery Helper"
 *   subtitle="Kids Ministry"
 *   detail="3 spots needed"
 *   secondaryDetail="Sun, Feb 9 · 11:00 AM"
 *   urgency="high"
 *   onClick={() => router.push('/serve/opportunities/1')}
 * />
 * ```
 */
export function OpportunityCard({
  title,
  subtitle,
  detail,
  secondaryDetail,
  urgency = 'low',
  onClick,
}: OpportunityCardProps) {
  const styles = urgencyStyles[urgency];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex h-32 w-40 flex-shrink-0 flex-col overflow-hidden p-3 text-left shadow-sm transition-all hover:shadow-md ${styles.bg}`}
    >
      {urgency === 'high' && (
        <span
          className={`mb-1 w-fit rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${styles.badge}`}
        >
          Needed
        </span>
      )}
      <h4 className="text-foreground line-clamp-2 text-xs font-bold tracking-wide uppercase">
        {title}
      </h4>
      {subtitle && <p className="text-muted-foreground mt-1 text-[10px]">{subtitle}</p>}
      <div className="mt-auto">
        {detail && <p className="text-muted-foreground text-[10px]">{detail}</p>}
        {secondaryDetail && <p className="text-muted-foreground text-[10px]">{secondaryDetail}</p>}
      </div>
    </motion.button>
  );
}
