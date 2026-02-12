'use client';

import { Users } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { CardInnerBlock } from './CardInnerBlock';
import type { CardAction } from './CardActions';

export interface GroupCardProps {
  /** Group name */
  title: string;
  /** Optional group type (e.g., "Life Group", "Small Group") */
  type?: string;
  /** Member count */
  memberCount?: number;
  /** Next meeting info (e.g., "Wed 7pm") */
  nextMeeting?: string;
  /** Show category watermark icon (default: true). Set to false when on Groups page. */
  showWatermark?: boolean;
  /** Optional custom icon (defaults to Users) */
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
 * Group/community card with people icon visual element.
 * Used in carousels for groups, teams, etc.
 *
 * @example
 * ```tsx
 * <GroupCard
 *   title="McCord Life Group"
 *   type="Life Group"
 *   memberCount={12}
 *   nextMeeting="Wed 7pm"
 *   onClick={() => router.push('/groups/123')}
 * />
 * ```
 */
export function GroupCard({
  title,
  type,
  memberCount,
  nextMeeting,
  showWatermark = true,
  icon: Icon = Users,
  onClick,
  className,
  shadowColor,
  actions,
}: GroupCardProps) {
  return (
    <BaseCard onClick={onClick} className={className} shadowColor={shadowColor} actions={actions}>
      {/* Watermark - shows category icon when card is outside its category page */}
      {showWatermark && <Icon className="text-watermark absolute right-1 bottom-1 h-12 w-12" />}

      {/* People icon block */}
      <CardInnerBlock shape="square" className="flex-col">
        {memberCount !== undefined ? (
          <>
            <span className="text-foreground text-lg leading-none font-bold">{memberCount}</span>
            <span className="text-muted-foreground text-[8px] font-semibold tracking-wide uppercase">
              members
            </span>
          </>
        ) : (
          <Icon className="text-muted-foreground h-6 w-6" />
        )}
      </CardInnerBlock>

      {/* Group info */}
      <div className="relative z-10 w-full text-center">
        {type && (
          <p className="text-muted-foreground/70 text-[9px] font-semibold tracking-wider uppercase">
            {type}
          </p>
        )}
        <p className="text-foreground line-clamp-2 text-xs leading-tight font-bold tracking-wide uppercase">
          {title}
        </p>
        {nextMeeting && <p className="text-muted-foreground mt-1 text-[10px]">{nextMeeting}</p>}
      </div>
    </BaseCard>
  );
}
