'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HorizontalScrollProps {
  children: React.ReactNode;
  /** Gap between items (tailwind gap class) */
  gap?: string;
  /** Optional action button text shown below the carousel */
  action?: string;
  /** Action button click handler */
  onAction?: () => void;
}

/**
 * Horizontal scrolling container with fade edges and navigation buttons.
 * Buttons appear when content is scrollable in that direction.
 *
 * @example
 * ```tsx
 * <HorizontalScroll action="View all" onAction={() => router.push('/items')}>
 *   {items.map(item => <Card key={item.id} />)}
 * </HorizontalScroll>
 * ```
 */
export function HorizontalScroll({
  children,
  gap = 'gap-4',
  action,
  onAction,
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="group/scroll relative">
      {/* Left fade & button */}
      {canScrollLeft && (
        <>
          <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-12 bg-gradient-to-r to-transparent" />
          <button
            onClick={() => scroll('left')}
            className="bg-background/90 hover:bg-muted absolute top-1/2 left-1 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition-all hover:scale-110"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="scrollbar-none overflow-x-auto py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className={`inline-flex ${gap} px-1`}>{children}</div>
      </div>

      {/* Right fade & button */}
      {canScrollRight && (
        <>
          <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-12 bg-gradient-to-l to-transparent" />
          <button
            onClick={() => scroll('right')}
            className="bg-background/90 hover:bg-muted absolute top-1/2 right-1 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition-all hover:scale-110"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Action link below carousel */}
      {action && onAction && (
        <button
          onClick={onAction}
          className="group/action text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1 pl-6 text-[10px] font-semibold tracking-wide uppercase transition-colors hover:bg-transparent"
        >
          {action}
          <ChevronRight className="h-3 w-3 transition-transform group-hover/action:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}
