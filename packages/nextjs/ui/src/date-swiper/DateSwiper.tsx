'use client';

import { useRef, useCallback, type RefObject } from 'react';
import { format, addDays, subDays, parseISO, isToday, isYesterday, isTomorrow } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SwipeableArch, DotIndicators, useSwipeGesture } from '../swipeable-primitives';

export interface DateSwiperProps {
  /** Currently selected date in 'yyyy-MM-dd' format */
  value: string;
  /** Callback when date changes */
  onChange: (date: string) => void;
  /** Additional class names for the container */
  className?: string;
  /** Show decorative arch line above dates */
  showArch?: boolean;
  /** Color for the arch gradient fill (e.g., '#a5d6a7'). Requires showArch. */
  archGradientColor?: string;
  /** Color for the arch gradient fill in dark mode. Falls back to archGradientColor if not set. */
  archGradientColorDark?: string;
  /** Show dot indicators (default: false for date picker since dates are infinite) */
  showDots?: boolean;
  /** Optional ref to content area - enables swiping from content to change dates */
  contentRef?: RefObject<HTMLElement | null>;
}

/**
 * A swipeable date selector with 3D arc effect.
 *
 * Features:
 * - Swipe left/right to change dates
 * - Shows previous, current, and next date
 * - Native date picker when clicking center date
 * - Displays day of week
 * - Special labels for Today/Yesterday/Tomorrow
 */
export function DateSwiper({
  value,
  onChange,
  className = '',
  showArch = true,
  archGradientColor,
  archGradientColorDark,
  showDots = false,
  contentRef,
}: DateSwiperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const selectedDate = parseISO(value);

  // Generate five visible dates (outer two only shown on large screens)
  const dates = [
    { date: subDays(selectedDate, 2), position: -2, lgOnly: true },
    { date: subDays(selectedDate, 1), position: -1, lgOnly: false },
    { date: selectedDate, position: 0, lgOnly: false },
    { date: addDays(selectedDate, 1), position: 1, lgOnly: false },
    { date: addDays(selectedDate, 2), position: 2, lgOnly: true },
  ];

  const handleNext = useCallback(() => {
    const newDate = format(addDays(selectedDate, 1), 'yyyy-MM-dd');
    onChange(newDate);
  }, [selectedDate, onChange]);

  const handlePrev = useCallback(() => {
    const newDate = format(subDays(selectedDate, 1), 'yyyy-MM-dd');
    onChange(newDate);
  }, [selectedDate, onChange]);

  const { dragOffset, isDragging } = useSwipeGesture({
    containerRef,
    additionalRefs: contentRef ? [contentRef] : [],
    activeIndex: 1, // Center date is always active
    itemCount: 3,
    onNext: handleNext,
    onPrev: handlePrev,
  });

  // Calculate transform for each date - arc effect
  const getDateStyle = (position: number) => {
    const dragInfluence = isDragging ? dragOffset / 200 : 0;
    const adjustedPosition = position + dragInfluence;

    const translateX = adjustedPosition * 80;
    const translateY = Math.abs(adjustedPosition) * 8;
    const scale = 1 - Math.abs(adjustedPosition) * 0.15;
    const opacity = 1 - Math.abs(adjustedPosition) * 0.6;

    return {
      transform: `translateX(${translateX}%) translateY(${translateY}px) scale(${scale})`,
      opacity: Math.max(0.2, opacity),
      zIndex: 10 - Math.abs(position),
    };
  };

  // Get friendly label for date
  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE'); // Short day name
  };

  // Handle click on center date to open native picker
  const handleCenterClick = () => {
    dateInputRef.current?.showPicker();
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-visible ${showArch ? 'mt-6 h-28' : 'h-32'} ${className}`}
    >
      {/* Hidden native date input */}
      <input
        ref={dateInputRef}
        type="date"
        value={value}
        onChange={(e) => {
          if (e.target.value) {
            onChange(e.target.value);
          }
        }}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        tabIndex={-1}
      />

      {/* Optional decorative arch with gradient */}
      {showArch && (
        <SwipeableArch
          gradientColor={archGradientColor}
          gradientColorDark={archGradientColorDark}
        />
      )}

      {/* Watermark chevrons */}
      <ChevronLeft
        className="text-muted-foreground/10 pointer-events-none absolute bottom-0 h-20 w-20 select-none"
        style={{ zIndex: 1, left: '-1.5rem' }}
        strokeWidth={1.5}
      />
      <ChevronRight
        className="text-muted-foreground/10 pointer-events-none absolute bottom-0 h-20 w-20 select-none"
        style={{ zIndex: 1, right: '-1.5rem' }}
        strokeWidth={1.5}
      />

      {/* Large click zones for left/right navigation */}
      <div
        onClick={handlePrev}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handlePrev()}
        className="absolute top-0 left-0 z-[5] h-full w-[40%] cursor-pointer"
        aria-label="Previous day"
      />
      <div
        onClick={handleNext}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
        className="absolute top-0 right-0 z-[5] h-full w-[40%] cursor-pointer"
        aria-label="Next day"
      />

      {/* Date labels */}
      {dates.map(({ date, position, lgOnly }) => {
        const isCenter = position === 0;
        const style = getDateStyle(position);
        const dayLabel = getDateLabel(date);
        const dateStr = format(date, 'MMM d');
        const dateKey = format(date, 'yyyy-MM-dd');

        return (
          <div
            key={dateKey}
            onClick={isCenter ? handleCenterClick : undefined}
            className={`absolute flex flex-col items-center px-6 py-2 transition-all select-none ${
              isDragging ? 'duration-0' : 'duration-300'
            } ${isCenter ? 'z-[15] cursor-pointer' : 'pointer-events-none'} ${
              lgOnly ? 'hidden lg:flex' : ''
            }`}
            style={style}
          >
            {/* Day of week / special label */}
            <span
              className={`text-xs font-semibold tracking-wider uppercase ${
                isCenter ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {dayLabel}
            </span>
            {/* Date */}
            <span
              className={`mt-0.5 text-lg font-bold tracking-wide uppercase ${
                isCenter ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {dateStr}
            </span>
            {/* Full date on center - clickable hint */}
            {isCenter && (
              <span className="text-muted-foreground mt-0.5 text-[10px] tracking-wide uppercase">
                {format(date, 'yyyy')}
              </span>
            )}
          </div>
        );
      })}

      {/* Optional dot indicators */}
      {showDots && (
        <DotIndicators count={3} activeIndex={1} onSelect={() => {}} className="bottom-0" />
      )}
    </div>
  );
}
