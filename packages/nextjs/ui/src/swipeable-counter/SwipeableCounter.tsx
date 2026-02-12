'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import { SwipeableArch, SwipeIndicators, useSwipeGesture } from '../swipeable-primitives';

export interface SwipeableCounterProps {
  /** Current value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Minimum value (default: 0) */
  min?: number;
  /** Maximum value (default: 9999) */
  max?: number;
  /** Step amount for increment/decrement (default: 1) */
  step?: number;
  /** Additional class names */
  className?: string;
  /** Callback when Enter is pressed in edit mode */
  onEnter?: () => void;
  /** Whether the counter is disabled */
  disabled?: boolean;
  /** Show decorative arch (default: true) */
  showArch?: boolean;
  /** Color for the arch gradient fill */
  archGradientColor?: string;
  /** Color for the arch gradient fill in dark mode */
  archGradientColorDark?: string;
  /** Show chevron navigation indicators (default: true) */
  showChevrons?: boolean;
  /** Auto-dismiss keyboard after idle time in ms (default: 3000, 0 to disable) */
  idleTimeout?: number;
}

/**
 * A swipeable counter component styled like DateSwiper.
 *
 * Features:
 * - Shows previous, current, and next values in a 3D arc
 * - Swipe left to increment, right to decrement
 * - Click chevrons to change value
 * - Tap the center number to type directly
 * - Decorative arch with gradient
 */
export function SwipeableCounter({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  className,
  onEnter,
  disabled = false,
  showArch = true,
  archGradientColor,
  archGradientColorDark,
  showChevrons = true,
  idleTimeout = 3000,
}: SwipeableCounterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset idle timer on input activity
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (idleTimeout > 0 && isEditing) {
      idleTimerRef.current = setTimeout(() => {
        inputRef.current?.blur();
      }, idleTimeout);
    }
  }, [idleTimeout, isEditing]);

  // Start idle timer when editing begins, clear when editing ends
  useEffect(() => {
    if (isEditing && idleTimeout > 0) {
      resetIdleTimer();
    }
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isEditing, idleTimeout, resetIdleTimer]);

  // Dismiss keyboard on touch outside the input
  useEffect(() => {
    if (!isEditing) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        inputRef.current.blur();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    return () => document.removeEventListener('touchstart', handleTouchStart);
  }, [isEditing]);

  // Generate the three visible values
  const values = [
    { value: Math.max(min, value - step), position: -1 },
    { value: value, position: 0 },
    { value: Math.min(max, value + step), position: 1 },
  ];

  // Sync temp value with actual value when not editing
  useEffect(() => {
    if (!isEditing) {
      setTempValue(value.toString());
    }
  }, [value, isEditing]);

  const handleIncrement = useCallback(() => {
    if (disabled) return;
    const newValue = Math.min(value + step, max);
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [value, step, max, onChange, disabled]);

  const handleDecrement = useCallback(() => {
    if (disabled) return;
    const newValue = Math.max(value - step, min);
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [value, step, min, onChange, disabled]);

  // Swipe gesture - swipe left to increment, right to decrement
  const { dragOffset, isDragging } = useSwipeGesture({
    containerRef,
    activeIndex: 1,
    itemCount: 3,
    onNext: handleIncrement,
    onPrev: handleDecrement,
    threshold: 40,
    disabled: disabled || isEditing,
  });

  // Calculate transform for each value - arc effect (matching DateSwiper)
  const getValueStyle = (position: number) => {
    const dragInfluence = isDragging ? dragOffset / 200 : 0;
    const adjustedPosition = position + dragInfluence;

    const translateX = adjustedPosition * 100;
    const translateY = Math.abs(adjustedPosition) * 8;
    const scale = 1 - Math.abs(adjustedPosition) * 0.15;
    const opacity = 1 - Math.abs(adjustedPosition) * 0.6;

    return {
      transform: `translateX(${translateX}%) translateY(${translateY}px) scale(${scale})`,
      opacity: Math.max(0.2, opacity),
      zIndex: 10 - Math.abs(position),
    };
  };

  const handleCenterClick = () => {
    if (disabled || isDragging) return;
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    const parsed = parseInt(tempValue) || 0;
    const clamped = Math.max(min, Math.min(max, parsed));
    onChange(clamped);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
      onEnter?.();
    } else if (e.key === 'Escape') {
      setTempValue(value.toString());
      setIsEditing(false);
    }
  };

  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center overflow-visible',
        showArch ? 'mt-6 h-28' : 'h-32',
        disabled && 'opacity-50',
        className
      )}
    >
      {/* Hidden input for direct editing */}
      {isEditing && (
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={tempValue}
          onChange={(e) => {
            setTempValue(e.target.value);
            resetIdleTimer();
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="absolute z-20 h-16 w-32 bg-transparent text-center text-5xl font-bold outline-none"
          min={min}
          max={max}
          autoFocus
        />
      )}

      {/* Optional decorative arch with gradient */}
      {showArch && (
        <SwipeableArch
          gradientColor={archGradientColor}
          gradientColorDark={archGradientColorDark}
        />
      )}

      {/* Chevron navigation indicators */}
      {showChevrons && (
        <SwipeIndicators
          canGoLeft={canDecrement}
          canGoRight={canIncrement}
          onLeft={handleDecrement}
          onRight={handleIncrement}
          bottomOffset={showArch ? -0.25 : 0.5}
        />
      )}

      {/* Large click zones for left/right navigation - everything outside center */}
      <div
        onClick={canDecrement ? handleDecrement : undefined}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && canDecrement && handleDecrement()}
        className={cn(
          'absolute top-0 left-0 z-[5] h-full w-1/2',
          canDecrement ? 'cursor-pointer' : 'cursor-default'
        )}
        aria-label="Decrease"
      />
      <div
        onClick={canIncrement ? handleIncrement : undefined}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && canIncrement && handleIncrement()}
        className={cn(
          'absolute top-0 right-0 z-[5] h-full w-1/2',
          canIncrement ? 'cursor-pointer' : 'cursor-default'
        )}
        aria-label="Increase"
      />

      {/* Watermark +/- symbols */}
      {!isEditing && (
        <>
          {/* Minus watermark on left */}
          {canDecrement && (
            <div
              className="text-muted-foreground/10 pointer-events-none absolute bottom-0 left-0 text-8xl font-bold select-none md:left-16 lg:left-28 xl:left-36"
              style={{ zIndex: 1 }}
            >
              −
            </div>
          )}
          {/* Plus watermark on right */}
          <div
            className="text-muted-foreground/10 pointer-events-none absolute right-0 bottom-0 text-8xl font-bold select-none md:right-16 lg:right-28 xl:right-36"
            style={{ zIndex: 1 }}
          >
            +
          </div>
        </>
      )}

      {/* Value labels */}
      {!isEditing &&
        values.map(({ value: val, position }) => {
          const isCenter = position === 0;
          const style = getValueStyle(position);

          // Don't show left value if at minimum
          if (position === -1 && !canDecrement) return null;

          return (
            <div
              key={val}
              onClick={isCenter ? handleCenterClick : undefined}
              className={cn(
                'absolute flex flex-col items-center px-6 py-2 transition-all select-none',
                isDragging ? 'duration-0' : 'duration-300',
                isCenter ? 'z-[15] cursor-pointer' : 'pointer-events-none'
              )}
              style={style}
            >
              {/* Value */}
              <span
                className={cn(
                  'mt-0.5 font-bold tracking-wide',
                  isCenter ? 'text-foreground text-4xl' : 'text-muted-foreground/40 text-2xl'
                )}
              >
                {val}
              </span>
            </div>
          );
        })}
    </div>
  );
}
