'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FilterConfig } from '../../_data/types';

interface MultiSelectDropdownProps {
  config: FilterConfig;
  selected: string[];
  onChange: (values: string[]) => void;
  /** Use white labels for dark backgrounds like bottom sheets */
  darkBackground?: boolean;
}

export default function MultiSelectDropdown({
  config,
  selected,
  onChange,
  darkBackground = false,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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

  function toggleAll() {
    onChange([]);
  }

  function getLabel() {
    if (allSelected) return config.defaultLabel;
    if (selected.length === 1) {
      return config.options.find((o) => o.value === selected[0])?.label ?? config.defaultLabel;
    }
    return null; // badge mode
  }

  const label = getLabel();

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`text-[10px] font-semibold tracking-wider uppercase ${
          darkBackground ? 'text-white' : 'text-muted-foreground'
        }`}
      >
        {config.label}
      </span>
      <div ref={ref} className="relative min-w-[160px]">
        <button
          type="button"
          className="border-border bg-card hover:border-primary focus:border-primary focus:ring-primary/20 flex w-full items-center justify-between gap-2 border px-3 py-2 text-sm font-semibold transition-all focus:ring-2 focus:outline-none"
          style={{ color: 'var(--foreground)' }}
          onClick={() => setOpen(!open)}
        >
          <span className="flex items-center gap-1.5">
            {label ?? (
              <>
                <span className="bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold">
                  {selected.length}
                </span>
                <span>{config.pluralLabel}</span>
              </>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div
            className="border-border bg-card absolute top-full right-0 left-0 z-50 min-w-[200px] overflow-y-auto border shadow-lg"
            style={{ maxHeight: 280 }}
          >
            {/* Select All */}
            <div
              className="bg-muted border-border hover:bg-accent flex cursor-pointer items-center gap-2.5 border-b px-3 py-2.5"
              onClick={toggleAll}
            >
              <input
                type="checkbox"
                checked={allSelected}
                readOnly
                className="accent-primary h-4 w-4"
              />
              <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Select All
              </span>
            </div>

            {config.options.map((opt) => {
              const checked = allSelected || selected.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  className={`hover:bg-accent flex cursor-pointer items-center gap-2.5 px-3 py-2.5 transition-colors ${
                    !allSelected && selected.includes(opt.value) ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => toggleOption(opt.value)}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className="accent-primary h-4 w-4"
                  />
                  <span className="text-foreground text-[13px]">{opt.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
