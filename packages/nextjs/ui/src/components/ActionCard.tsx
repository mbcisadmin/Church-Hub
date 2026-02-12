'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { cn } from '../lib/utils';

/**
 * Base interaction styles for action cards.
 * Can be used with cn() to compose custom card variants.
 */
export const actionCardStyles = {
  base: 'flex items-center gap-4 border p-4 transition-all duration-200',
  interactive:
    'touch-manipulation hover:scale-[1.02] hover:shadow-lg hover:bg-card active:scale-[0.98] active:shadow-sm',
  default: 'border-border bg-card shadow-sm',
};

/**
 * Get combined action card classes with optional overrides.
 * Useful when you need the styles but not the full component.
 */
export function getActionCardClasses(className?: string) {
  return cn(
    actionCardStyles.base,
    actionCardStyles.interactive,
    actionCardStyles.default,
    className
  );
}

export interface ActionCardProps {
  /** Card content */
  children: ReactNode;
  /** Click handler (for button behavior) */
  onClick?: () => void;
  /** Navigation href (renders as Next.js Link) */
  href?: string;
  /** Additional class names for customization */
  className?: string;
  /** Disable hover/active interactions */
  static?: boolean;
}

/**
 * A flexible, interactive card component with consistent interaction styles.
 *
 * Features:
 * - Base styles: border, background, subtle shadow
 * - Hover: slight scale up (1.02) with larger shadow
 * - Active/Click: scale down (0.98) with reduced shadow
 * - Supports onClick (button), href (Link), or static (no interaction)
 *
 * Use cases:
 * - App/dashboard cards on homepage
 * - Search results
 * - Event lists
 * - People search results
 * - Any clickable list item
 *
 * For custom styling (like colored backgrounds), pass className to override defaults.
 *
 * @example Basic usage with onClick
 * ```tsx
 * <ActionCard onClick={() => handleSelect(item)}>
 *   <Icon name="calendar" className="h-8 w-8 text-primary" />
 *   <div>
 *     <p className="font-semibold">Event Name</p>
 *     <p className="text-sm text-muted-foreground">7:00 AM</p>
 *   </div>
 * </ActionCard>
 * ```
 *
 * @example Navigation with Link
 * ```tsx
 * <ActionCard href="/apps/counter">
 *   <Icon name="calculator" className="h-8 w-8 text-primary" />
 *   <div className="flex-1">
 *     <p className="font-semibold">Counter</p>
 *     <p className="text-sm text-muted-foreground">Event attendance tracking</p>
 *   </div>
 *   <ChevronRight className="h-5 w-5 text-muted-foreground" />
 * </ActionCard>
 * ```
 *
 * @example Custom styling (colored card)
 * ```tsx
 * <ActionCard
 *   href="/circles/community"
 *   className="bg-green-100 border-green-200"
 * >
 *   <span className="font-bold text-green-800">COMMUNITY</span>
 *   <span className="ml-auto font-semibold">11,424</span>
 * </ActionCard>
 * ```
 */
export function ActionCard({
  children,
  onClick,
  href,
  className,
  static: isStatic = false,
}: ActionCardProps) {
  const baseClasses = cn(
    actionCardStyles.base,
    !isStatic && actionCardStyles.interactive,
    actionCardStyles.default,
    className
  );

  // Link variant
  if (href) {
    return (
      <Link href={href} className={cn('group block', !isStatic && 'cursor-pointer')}>
        <div className={baseClasses}>{children}</div>
      </Link>
    );
  }

  // Button variant
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(baseClasses, 'group w-full text-left')}>
        {children}
      </button>
    );
  }

  // Static variant (no interaction)
  return <div className={baseClasses}>{children}</div>;
}
