'use client';

import { cn } from '../lib/utils';

interface SectionHeaderProps {
  /** Title content - can be a string or ReactNode with TitleHighlight components */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** @deprecated Use variant="watermark" instead */
  iconOffset?: string;
  /** @deprecated Use variant="watermark" instead */
  iconSize?: string;
  /** @deprecated Use variant="watermark" instead */
  mobileIconSize?: string;
  /** Display variant: "inline" shows icon with connecting line, "watermark" shows large background icon */
  variant?: 'inline' | 'watermark';
  as?: 'h1' | 'h2';
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  iconOffset = '4rem',
  iconSize = '160px',
  mobileIconSize = '80px',
  variant = 'inline',
  as: Heading = 'h2',
  actions,
  className,
}: SectionHeaderProps) {
  // Inline variant: icon with connecting line
  if (variant === 'inline') {
    return (
      <div className={cn('relative mb-6 px-2 md:mb-10 md:px-0', className)}>
        <div className={cn('relative', actions && 'flex items-start gap-3')}>
          <div className="min-w-0 flex-1">
            {/* Title row with line and icon */}
            <div className="flex items-center gap-3">
              <Heading className="text-foreground text-2xl font-bold tracking-tighter uppercase md:text-4xl lg:text-5xl">
                {title}
              </Heading>
              {/* Connecting line */}
              <div className="bg-foreground/20 h-px flex-1" />
              {/* Inline icon */}
              <Icon className="text-foreground h-5 w-5 flex-shrink-0 md:h-6 md:w-6" />
            </div>
            {subtitle && (
              <div className="text-muted-foreground mt-1 text-xs font-normal tracking-widest uppercase md:text-sm">
                {subtitle}
              </div>
            )}
          </div>
          {actions}
        </div>
      </div>
    );
  }

  // Watermark variant: large background icon (original behavior)
  return (
    <div className={cn('relative mb-10 overflow-visible px-2 md:px-0', className)}>
      {/* Mobile watermark icon — positioned at right edge of full container */}
      <Icon
        className="text-watermark pointer-events-none absolute top-1/2 -right-2 -translate-y-1/2 md:hidden"
        style={{
          width: mobileIconSize,
          height: mobileIconSize,
        }}
      />
      <div className={cn('relative', actions && 'flex items-start gap-3')}>
        <div className="min-w-0 flex-1">
          {/* Wrapper for heading - desktop watermark positions relative to this */}
          <div className="relative inline-block">
            <Heading className="text-foreground relative z-10 text-2xl font-bold tracking-tighter uppercase sm:text-3xl md:text-7xl lg:text-8xl">
              {title}
            </Heading>
            {/* Desktop watermark icon - tucked behind end of text */}
            <Icon
              className="text-watermark pointer-events-none absolute hidden md:block"
              style={{
                top: '0',
                left: `calc(100% - ${parseInt(iconSize) / 3}px)`,
                width: iconSize,
                height: iconSize,
              }}
            />
          </div>
          {/* Subtitle outside inline-block so it gets full container width */}
          {subtitle && (
            <div className="text-muted-foreground relative z-10 mt-1 text-xs font-normal tracking-widest uppercase sm:pl-6 sm:text-sm md:text-base">
              {subtitle}
            </div>
          )}
        </div>
        {actions}
      </div>
    </div>
  );
}
