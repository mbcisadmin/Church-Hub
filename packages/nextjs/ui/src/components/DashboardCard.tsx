'use client';

import { BarChart3 } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { CardInnerBlock } from './CardInnerBlock';
import type { CardAction } from './CardActions';

export interface DashboardCardProps {
  /** Dashboard title */
  title: string;
  /** Optional category/type label */
  category?: string;
  /** Optional stat to display (e.g., "142", "85%") */
  stat?: string;
  /** Optional stat label (e.g., "active", "complete") */
  statLabel?: string;
  /** Show category watermark icon (default: true). Set to false when on Dashboards page. */
  showWatermark?: boolean;
  /** Optional custom icon (defaults to BarChart3) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Click handler */
  onClick: () => void;
  /** Optional className for custom styling (e.g., colored backgrounds) */
  className?: string;
  /** Optional shadow color for colored cards */
  shadowColor?: string;
  /** Optional action buttons that appear on hover */
  actions?: CardAction[];
}

/**
 * Dashboard/analytics card with chart icon visual element.
 * Used in carousels for dashboards, reports, etc.
 *
 * @example
 * ```tsx
 * <DashboardCard
 *   title="Circles"
 *   category="Small Groups"
 *   stat="142"
 *   statLabel="active"
 *   onClick={() => router.push('/dashboards/circles')}
 * />
 * ```
 */
export function DashboardCard({
  title,
  category,
  stat,
  statLabel,
  showWatermark = true,
  icon: Icon = BarChart3,
  onClick,
  className,
  shadowColor,
  actions,
}: DashboardCardProps) {
  return (
    <BaseCard onClick={onClick} className={className} shadowColor={shadowColor} actions={actions}>
      {/* Watermark - shows category icon when card is outside its category page */}
      {showWatermark && <Icon className="text-watermark absolute right-1 bottom-1 h-12 w-12" />}

      {/* Chart icon block */}
      <CardInnerBlock shape="square" className="flex-col">
        {stat ? (
          <>
            <span className="text-foreground text-lg leading-none font-bold">{stat}</span>
            {statLabel && (
              <span className="text-muted-foreground text-[8px] font-semibold tracking-wide uppercase">
                {statLabel}
              </span>
            )}
          </>
        ) : (
          <Icon className="text-muted-foreground h-6 w-6" />
        )}
      </CardInnerBlock>

      {/* Dashboard info */}
      <div className="relative z-10 w-full text-center">
        {category && (
          <p className="text-muted-foreground/70 text-[9px] font-semibold tracking-wider uppercase">
            {category}
          </p>
        )}
        <p className="text-foreground line-clamp-2 text-xs leading-tight font-bold tracking-wide uppercase">
          {title}
        </p>
      </div>
    </BaseCard>
  );
}
