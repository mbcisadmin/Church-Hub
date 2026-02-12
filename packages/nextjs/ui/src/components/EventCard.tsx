'use client';

import { CalendarDays } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { CardInnerBlock } from './CardInnerBlock';
import type { CardAction } from './CardActions';

export interface EventCardProps {
  /** Event title */
  title: string;
  /** Day abbreviation (e.g., "Sun", "Mon") */
  day: string;
  /** Date number (e.g., "9", "21") */
  date: string;
  /** Time string (e.g., "8:30 AM") */
  time: string;
  /** Optional type/category label (e.g., "Serving", "Registered") */
  type?: string;
  /** Show category watermark icon (default: true). Set to false when on Events page. */
  showWatermark?: boolean;
  /** Optional custom watermark icon (defaults to CalendarDays) */
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
 * Calendar-style event card showing day, date, title, and time.
 * Used in carousels for upcoming events, my events, etc.
 *
 * @example
 * ```tsx
 * <EventCard
 *   title="Winter Retreat"
 *   day="Fri"
 *   date="21"
 *   time="6:00 PM"
 *   type="Registered"
 *   onClick={() => router.push('/events/123')}
 * />
 * ```
 */
export function EventCard({
  title,
  day,
  date,
  time,
  type,
  showWatermark = true,
  icon: Icon = CalendarDays,
  onClick,
  className,
  shadowColor,
  actions,
}: EventCardProps) {
  return (
    <BaseCard onClick={onClick} className={className} shadowColor={shadowColor} actions={actions}>
      {/* Watermark - shows category icon when card is outside its category page */}
      {showWatermark && <Icon className="text-watermark absolute right-1 bottom-1 h-12 w-12" />}

      {/* Calendar date block */}
      <CardInnerBlock shape="square" className="flex-col">
        <span className="text-muted-foreground text-[10px] font-bold tracking-wide uppercase">
          {day}
        </span>
        <span className="text-foreground text-xl leading-none font-bold">{date}</span>
      </CardInnerBlock>

      {/* Event info */}
      <div className="relative z-10 w-full text-center">
        {type && (
          <p className="text-muted-foreground/70 text-[9px] font-semibold tracking-wider uppercase">
            {type}
          </p>
        )}
        <p className="text-foreground line-clamp-2 text-xs leading-tight font-bold tracking-wide uppercase">
          {title}
        </p>
        <p className="text-muted-foreground mt-1 text-[10px]">{time}</p>
      </div>
    </BaseCard>
  );
}
