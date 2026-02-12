'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string = string> {
  /** The available options */
  options: SegmentOption<T>[];
  /** Currently selected value */
  value: T;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Additional class names for the container */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color scheme for the selected indicator */
  variant?: 'default' | 'primary' | 'secondary';
}

/**
 * A segmented control component for switching between distinct options.
 * Features a sliding pill indicator that animates between selections.
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   options={[
 *     { value: 'inCircle', label: 'In Circle' },
 *     { value: 'joinedCircle', label: 'Joined Circle' },
 *   ]}
 *   value={chartMode}
 *   onChange={setChartMode}
 * />
 * ```
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
  variant = 'default',
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(() =>
    options.findIndex((opt) => opt.value === value)
  );

  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-1.5',
    md: 'text-sm py-2.5',
    lg: 'text-base py-3',
  };

  // Variant classes for the indicator
  const variantClasses = {
    default: 'bg-foreground dark:bg-white',
    primary: 'bg-primary dark:bg-primary',
    secondary: 'bg-secondary dark:bg-white',
  };

  // Text color when selected (needs contrast with indicator)
  const selectedTextClasses = {
    default: 'text-background dark:text-black',
    primary: 'text-primary-foreground',
    secondary: 'text-white dark:text-secondary',
  };

  // Update selected index when value changes
  useEffect(() => {
    const index = options.findIndex((opt) => opt.value === value);
    if (index !== -1) {
      setSelectedIndex(index);
    }
  }, [value, options]);

  return (
    <div ref={containerRef} className={`bg-muted relative flex dark:bg-white/10 ${className}`}>
      {/* Sliding indicator */}
      <motion.div
        className={`absolute top-0 bottom-0 h-full ${variantClasses[variant]}`}
        style={{
          width: `${100 / options.length}%`,
        }}
        initial={false}
        animate={{
          x: `${selectedIndex * 100}%`,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
        }}
      />

      {/* Options */}
      {options.map((option, index) => {
        const isSelected = option.value === value;

        const handleClick = () => {
          if (isSelected) {
            // Cycle to next option (wrap around)
            const nextIndex = (index + 1) % options.length;
            onChange(options[nextIndex].value);
          } else {
            onChange(option.value);
          }
        };

        return (
          <button
            key={option.value}
            type="button"
            onClick={handleClick}
            className={`relative z-10 flex-1 text-center font-semibold tracking-wide uppercase transition-colors duration-200 ${sizeClasses[size]} ${
              isSelected ? selectedTextClasses[variant] : 'text-muted-foreground'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
