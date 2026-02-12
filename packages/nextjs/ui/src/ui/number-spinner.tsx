'use client';

import { useState, useRef, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface NumberSpinnerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  onEnter?: () => void;
}

export function NumberSpinner({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  className,
  onEnter,
}: NumberSpinnerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setTempValue(value.toString());
    }
  }, [value, isEditing]);

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
    triggerAnimation();
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
    triggerAnimation();
  };

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleClick = () => {
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
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Minus Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className="bg-muted hover:bg-primary hover:text-primary-foreground flex h-12 w-12 items-center justify-center transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Minus className="h-5 w-5" />
      </button>

      {/* Number Display/Input */}
      <div
        onClick={!isEditing ? handleClick : undefined}
        className={cn(
          'bg-card border-border relative flex h-16 min-w-[120px] cursor-pointer items-center justify-center border-2 transition-all',
          isAnimating && 'border-primary scale-105',
          isEditing && 'ring-primary cursor-text ring-2'
        )}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="h-full w-full bg-transparent text-center text-4xl font-bold outline-none"
            min={min}
            max={max}
          />
        ) : (
          <div
            className={cn(
              'text-primary text-5xl font-bold transition-all',
              isAnimating && 'animate-bounce'
            )}
          >
            {value}
          </div>
        )}
      </div>

      {/* Plus Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className="bg-muted hover:bg-primary hover:text-primary-foreground flex h-12 w-12 items-center justify-center transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
