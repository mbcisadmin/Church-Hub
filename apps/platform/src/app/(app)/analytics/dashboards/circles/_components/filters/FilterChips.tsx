'use client';

import { Check } from 'lucide-react';
import type { FilterConfig } from '../../_data/types';

interface FilterChipsProps {
  config: FilterConfig;
  selected: string[];
  onChange: (values: string[]) => void;
  /** Use white/dark styling for dark backgrounds */
  darkBackground?: boolean;
}

/**
 * Chip-based multi-select filter component.
 * Better for touch interfaces than dropdowns - all options visible, easy to tap.
 */
export default function FilterChips({
  config,
  selected,
  onChange,
  darkBackground = false,
}: FilterChipsProps) {
  const allValues = config.options.map((o) => o.value);
  const allSelected = selected.length === 0 || selected.length === allValues.length;

  function toggleOption(value: string) {
    let next: string[];
    if (selected.includes(value)) {
      next = selected.filter((v) => v !== value);
      // If nothing selected, reset to all
      if (next.length === 0) next = [];
    } else {
      next = [...selected, value];
      // If all selected, reset to empty (= all)
      if (next.length === allValues.length) next = [];
    }
    onChange(next);
  }

  function selectAll() {
    onChange([]);
  }

  return (
    <div className="flex flex-col gap-2">
      <span
        className={`text-[10px] font-semibold tracking-wider uppercase ${
          darkBackground ? 'text-white/70' : 'text-muted-foreground'
        }`}
      >
        {config.label}
      </span>
      <div className="flex flex-wrap gap-2">
        {/* Select All chip */}
        <button
          type="button"
          onClick={selectAll}
          className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all ${
            allSelected
              ? darkBackground
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary text-primary-foreground'
              : darkBackground
                ? 'bg-white/10 text-white/70 hover:bg-white/20'
                : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          {allSelected && <Check className="h-3.5 w-3.5" />}
          All
        </button>

        {config.options.map((opt) => {
          const isSelected = !allSelected && selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleOption(opt.value)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? darkBackground
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary text-primary-foreground'
                  : darkBackground
                    ? 'bg-white/10 text-white/70 hover:bg-white/20'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {isSelected && <Check className="h-3.5 w-3.5" />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
