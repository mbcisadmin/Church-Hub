'use client';

import { User } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { CardInnerBlock } from './CardInnerBlock';
import type { CardAction } from './CardActions';

export interface PersonCardProps {
  /** Person's name */
  name: string;
  /** Optional role/title */
  role?: string;
  /** Optional avatar URL */
  avatarUrl?: string;
  /** Optional initials (used if no avatar) */
  initials?: string;
  /** Optional subtitle (e.g., email, department) */
  subtitle?: string;
  /** Show category watermark icon (default: true). Set to false when on People page. */
  showWatermark?: boolean;
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
 * Person/contact card with avatar visual element.
 * Used in carousels for contacts, staff, etc.
 *
 * @example
 * ```tsx
 * <PersonCard
 *   name="John Smith"
 *   role="Staff"
 *   initials="JS"
 *   subtitle="jsmith@church.com"
 *   onClick={() => router.push('/people/123')}
 * />
 * ```
 */
export function PersonCard({
  name,
  role,
  avatarUrl,
  initials,
  subtitle,
  showWatermark = true,
  onClick,
  className,
  shadowColor,
  actions,
}: PersonCardProps) {
  return (
    <BaseCard onClick={onClick} className={className} shadowColor={shadowColor} actions={actions}>
      {/* Watermark - shows category icon when card is outside its category page */}
      {showWatermark && <User className="text-watermark absolute right-1 bottom-1 h-12 w-12" />}

      {/* Avatar block */}
      <CardInnerBlock shape="circle">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : initials ? (
          <span className="text-foreground text-lg font-bold">{initials}</span>
        ) : (
          <User className="text-muted-foreground h-6 w-6" />
        )}
      </CardInnerBlock>

      {/* Person info */}
      <div className="relative z-10 w-full text-center">
        {role && (
          <p className="text-muted-foreground/70 text-[9px] font-semibold tracking-wider uppercase">
            {role}
          </p>
        )}
        <p className="text-foreground line-clamp-2 text-xs leading-tight font-bold tracking-wide uppercase">
          {name}
        </p>
        {subtitle && <p className="text-muted-foreground mt-1 truncate text-[10px]">{subtitle}</p>}
      </div>
    </BaseCard>
  );
}
