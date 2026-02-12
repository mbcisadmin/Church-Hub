'use client';

import { useRef, useEffect, useState, type CSSProperties } from 'react';

interface SegmentedControlItem {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  items: SegmentedControlItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  rounded?: boolean;
}

export function SegmentedControl({
  items,
  activeId,
  onChange,
  className = '',
  rounded = true,
}: SegmentedControlProps) {
  const containerRadius = rounded ? 'rounded-full' : 'rounded-md';
  const pillRadius = rounded ? 'rounded-full' : 'rounded-sm';
  const btnRadius = rounded ? 'rounded-full' : 'rounded-sm';
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState<CSSProperties>({});

  // Update the sliding highlight position when activeId changes
  useEffect(() => {
    if (!containerRef.current) return;
    const activeIndex = items.findIndex((item) => item.id === activeId);
    if (activeIndex === -1) return;

    const buttons = containerRef.current.querySelectorAll<HTMLButtonElement>('[data-segment-btn]');
    const activeBtn = buttons[activeIndex];
    if (!activeBtn) return;

    setHighlightStyle({
      left: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
    });
  }, [activeId, items]);

  return (
    <div
      ref={containerRef}
      className={`scrollbar-hide bg-muted relative inline-flex overflow-x-auto ${containerRadius} p-1 ${className}`}
    >
      {/* Sliding highlight */}
      <div
        className={`bg-foreground absolute top-1 bottom-1 ${pillRadius} transition-all duration-200 ease-out`}
        style={highlightStyle}
      />

      {/* Buttons */}
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            data-segment-btn
            onClick={() => onChange(item.id)}
            className={`relative z-10 ${btnRadius} px-3 py-1.5 text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition-colors duration-200 ${
              isActive ? 'text-background' : 'text-muted-foreground'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
