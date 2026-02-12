'use client';

import { useId, useState, useEffect } from 'react';

export interface SwipeableArchProps {
  /** Color for the arch gradient fill (e.g., '#a5d6a7') */
  gradientColor?: string;
  /** Color for the arch gradient fill in dark mode. Falls back to gradientColor if not set. */
  gradientColorDark?: string;
  /** Additional class names */
  className?: string;
}

/**
 * A decorative arch SVG with gradient fill.
 * Commonly used above swipeable tab selectors for visual polish.
 */
export function SwipeableArch({
  gradientColor,
  gradientColorDark,
  className = '',
}: SwipeableArchProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const instanceId = useId();

  useEffect(() => {
    setMounted(true);
    const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Use dark color if in dark mode and provided, otherwise fall back to light color
  const effectiveColor = isDark && gradientColorDark ? gradientColorDark : gradientColor;

  // Don't render until mounted to prevent hydration flash
  if (!mounted) return null;

  const strokeGradientId = `swipeArch-stroke-${instanceId}`;
  const fillGradientId = `swipeArch-fill-${instanceId}`;

  return (
    <svg
      className={`pointer-events-none absolute -top-4 right-0 left-0 h-32 w-full ${className}`}
      style={{ animation: 'swipeArch-fadeIn 300ms ease-out' }}
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={strokeGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={effectiveColor || 'currentColor'} stopOpacity="0" />
          <stop offset="30%" stopColor={effectiveColor || 'currentColor'} stopOpacity="0.25" />
          <stop offset="50%" stopColor={effectiveColor || 'currentColor'} stopOpacity="0.35" />
          <stop offset="70%" stopColor={effectiveColor || 'currentColor'} stopOpacity="0.25" />
          <stop offset="100%" stopColor={effectiveColor || 'currentColor'} stopOpacity="0" />
        </linearGradient>
        {effectiveColor && (
          <radialGradient id={fillGradientId} cx="50%" cy="0%" rx="60%" ry="80%">
            <stop offset="0%" stopColor={effectiveColor} stopOpacity="0.18" />
            <stop offset="60%" stopColor={effectiveColor} stopOpacity="0.15" />
            <stop offset="85%" stopColor={effectiveColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor={effectiveColor} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>
      {/* Fill under the arch that fades down and to sides */}
      {effectiveColor && (
        <path d="M0 12 Q50 0 100 12 L100 40 L0 40 Z" fill={`url(#${fillGradientId})`} />
      )}
      {/* Arch stroke line */}
      <path
        d="M0 12 Q50 0 100 12"
        fill="none"
        stroke={`url(#${strokeGradientId})`}
        strokeWidth="0.6"
      />
      <style>
        {`
          @keyframes swipeArch-fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </svg>
  );
}
