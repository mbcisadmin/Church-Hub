'use client';

import { useEffect, useState } from 'react';

const PATH_LENGTH = 560;

// Slightly irregular oval that overshoots the start point for a natural crossover
const CIRCLE_PATH =
  'M 18,52 C 16,32 42,8 100,6 C 158,4 186,28 188,50 C 190,72 160,96 100,94 C 40,92 14,72 16,52 C 17,42 28,30 42,24';

/**
 * Wraps children with an animated hand-drawn circle SVG.
 * The circle "draws" itself on after a delay, then fades out.
 */
export function CircleDrawEffect({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'waiting' | 'drawing' | 'fading' | 'done'>('waiting');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Start drawing after page settles
    timers.push(setTimeout(() => setPhase('drawing'), 800));
    // Fade out after draw completes (800 + 1200ms draw)
    timers.push(setTimeout(() => setPhase('fading'), 2400));
    // Remove from DOM
    timers.push(setTimeout(() => setPhase('done'), 3400));

    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === 'done') {
    return <span>{children}</span>;
  }

  return (
    <span className="relative inline-block">
      {children}
      <svg
        className="pointer-events-none absolute"
        style={{
          top: '-45%',
          left: '-14%',
          width: '128%',
          height: '190%',
          transform: 'rotate(-4deg)',
          opacity: phase === 'fading' ? 0 : 1,
          transition: 'opacity 1s ease-out',
        }}
        viewBox="0 0 200 100"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d={CIRCLE_PATH}
          stroke="var(--foreground)"
          strokeWidth="3.5"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          fill="none"
          style={{
            strokeDasharray: PATH_LENGTH,
            strokeDashoffset: phase === 'waiting' ? PATH_LENGTH : 0,
            transition:
              phase === 'waiting'
                ? 'none'
                : 'stroke-dashoffset 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        />
      </svg>
    </span>
  );
}
