'use client';

import { cn } from '../lib/utils';

// ============================================================================
// Action Button Variants
// ============================================================================

const variants = {
  /** Brand color (green) - rightmost, primary CTA */
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  /** Dark/foreground color - secondary actions like search */
  secondary: 'bg-foreground text-background hover:bg-foreground/90',
  /** Muted/gray - tertiary actions like pin, settings */
  tertiary: 'bg-muted text-muted-foreground hover:bg-muted/80',
};

export type PageActionVariant = keyof typeof variants;

// ============================================================================
// PageActionButton
// ============================================================================

export interface PageActionButtonProps {
  /** Icon component to render */
  icon: React.ComponentType<{ className?: string }>;
  /** Accessible label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Visual variant */
  variant?: PageActionVariant;
  /** Additional className */
  className?: string;
}

/**
 * Circular icon-only action button for page headers.
 * Matches the standardized 48px circle pattern used across category pages.
 */
export function PageActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'primary',
  className,
}: PageActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition-all hover:shadow-md',
        variants[variant],
        className
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

// ============================================================================
// PageActions Container
// ============================================================================

export interface PageActionsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container for page header action buttons.
 * Renders children in a horizontal row with consistent gap.
 *
 * Convention: order buttons tertiary → secondary → primary (left to right),
 * with the primary CTA on the far right.
 */
export function PageActions({ children, className }: PageActionsProps) {
  return <div className={cn('flex items-center gap-3', className)}>{children}</div>;
}
