'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface OptionGroup {
  label: string;
  options: Option[];
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: Option[];
  groupedOptions?: OptionGroup[];
  placeholder?: string;
  className?: string;
  clearable?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options = [],
  groupedOptions = [],
  placeholder = 'Select an option',
  className = '',
  clearable = true,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten grouped options into a single array for searching
  const allOptions =
    groupedOptions.length > 0 ? groupedOptions.flatMap((group) => group.options) : options;

  // Filter options based on search term
  const filteredOptions = allOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter grouped options based on search term
  const filteredGroupedOptions =
    groupedOptions.length > 0
      ? groupedOptions
          .map((group) => ({
            ...group,
            options: group.options.filter((option) =>
              option.label.toLowerCase().includes(searchTerm.toLowerCase())
            ),
          }))
          .filter((group) => group.options.length > 0)
      : [];

  // Get selected option label
  const selectedOption = allOptions.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`border-border bg-background text-foreground flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-4 py-2 focus:ring-2 focus:ring-[#61bc47] focus:outline-none ${className}`}
      >
        <span
          className={`flex-1 text-left ${selectedOption ? 'text-foreground' : 'text-muted-foreground'}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {clearable && selectedOption && (
            <button
              type="button"
              onClick={handleClear}
              className="hover:bg-accent rounded p-0.5 transition-colors"
              aria-label="Clear selection"
            >
              <X className="text-muted-foreground h-3.5 w-3.5" />
            </button>
          )}
          <ChevronsUpDown className="text-muted-foreground h-4 w-4" />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="bg-background border-border absolute z-50 mt-1 flex max-h-[300px] w-full flex-col rounded-lg border shadow-lg">
          {/* Search Input */}
          <div className="border-border border-b p-2">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="border-border bg-background text-foreground w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-[#61bc47] focus:outline-none"
            />
          </div>

          {/* Options List */}
          <div className="flex-1 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="text-muted-foreground px-4 py-3 text-center text-sm">
                No results found
              </div>
            ) : groupedOptions.length > 0 ? (
              // Render grouped options
              filteredGroupedOptions.map((group) => (
                <div key={group.label}>
                  <div className="text-muted-foreground bg-muted/50 sticky top-0 px-4 py-2 text-xs font-semibold uppercase">
                    {group.label}
                  </div>
                  {group.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`hover:bg-accent flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                        option.value === value ? 'bg-accent' : ''
                      }`}
                    >
                      <span>{option.label}</span>
                      {option.value === value && <Check className="h-4 w-4 text-[#61BC47]" />}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              // Render flat options
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`hover:bg-accent flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                    option.value === value ? 'bg-accent' : ''
                  }`}
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check className="h-4 w-4 text-[#61BC47]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
