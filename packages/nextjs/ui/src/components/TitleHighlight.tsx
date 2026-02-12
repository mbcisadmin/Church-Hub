'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type AnimationType = 'underline' | 'highlight' | 'glow' | 'ellipses';

interface TitleHighlightProps {
  children: React.ReactNode;
  /** Type of animation to apply */
  animation?: AnimationType;
  /** Color for the animation (default: black for underline, yellow for highlight) */
  color?: string;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Whether animation should loop */
  loop?: boolean;
  /** Whether to fade out after animation completes */
  fadeOut?: boolean;
  /** Delay before fade out in seconds (only if fadeOut is true) */
  fadeOutDelay?: number;
  /** Inset the underline from each side (underline only). Use CSS units like "0.5rem" or "4px" */
  inset?: string;
}

/**
 * Wrap text in a title to apply animations to specific parts.
 * Use inside SectionHeader's title prop for flexible text animations.
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   title={
 *     <>
 *       <TitleHighlight animation="underline">Good morning</TitleHighlight>, Colton
 *     </>
 *   }
 * />
 * ```
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   title={
 *     <>
 *       Welcome to <TitleHighlight animation="highlight" color="#fef08a">The Hub</TitleHighlight>
 *     </>
 *   }
 * />
 * ```
 */
export function TitleHighlight({
  children,
  animation = 'underline',
  color,
  duration = 0.6,
  delay = 0,
  loop = false,
  fadeOut = true,
  fadeOutDelay = 0.8,
  inset,
}: TitleHighlightProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
    }
  }, [children]);

  // Default colors per animation type
  const defaultColors: Record<AnimationType, string> = {
    underline: '#000000',
    highlight: '#fef08a',
    glow: '#aad43c',
    ellipses: '#000000',
  };

  const animationColor = color || defaultColors[animation];

  const renderAnimation = () => {
    switch (animation) {
      case 'underline': {
        const underlineWidth = inset ? `calc(${width}px - ${inset} * 2)` : width;
        return (
          <motion.div
            className="absolute -bottom-0.5 h-0.5 md:-bottom-1 md:h-1"
            style={{ backgroundColor: animationColor, left: inset || 0 }}
            initial={{ width: 0, opacity: 1 }}
            animate={{
              width: underlineWidth,
              opacity: fadeOut ? 0 : 1,
            }}
            transition={{
              width: { duration, delay, ease: 'easeOut' },
              opacity: fadeOut
                ? { duration: 0.4, delay: delay + duration + fadeOutDelay, ease: 'easeOut' }
                : { duration: 0 },
            }}
          />
        );
      }

      case 'highlight':
        return (
          <motion.div
            className="absolute inset-0 -z-10 -mx-1 -my-0.5 rounded"
            initial={{ scaleX: 0, opacity: 0.7 }}
            animate={{
              scaleX: 1,
              opacity: fadeOut ? 0 : 0.7,
            }}
            transition={{
              scaleX: { duration, delay, ease: 'easeOut' },
              opacity: fadeOut
                ? { duration: 0.4, delay: delay + duration + fadeOutDelay, ease: 'easeOut' }
                : { duration: 0 },
            }}
            style={{
              backgroundColor: animationColor,
              transformOrigin: 'left',
            }}
          />
        );

      case 'glow':
        return (
          <motion.div
            className="pointer-events-none absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{
              opacity: fadeOut ? [0, 1, 0] : [0, 1],
            }}
            transition={{
              duration: fadeOut ? duration + fadeOutDelay : duration,
              delay,
              ease: 'easeInOut',
              repeat: loop ? Infinity : 0,
            }}
            style={{
              boxShadow: `0 0 20px 10px ${animationColor}`,
              borderRadius: '4px',
            }}
          />
        );

      case 'ellipses': {
        // Three dots that bounce up left-to-right, then pop right-to-left with burst rays
        const dotSize = 'clamp(10px, 0.65em, 16px)';
        const dotGap = 'clamp(6px, 0.4em, 10px)';
        const cycleDuration = duration * 3; // Full cycle including pop

        // Timing arrays for each dot - bounce left-to-right, pop right-to-left
        const dotTimings = [
          // Dot 0: bounces first (0.08-0.22), pops last (0.58-0.78)
          { times: [0, 0.08, 0.22, 0.58, 0.7, 0.78], burstTimes: [0, 0.22, 0.45, 0.58, 0.7, 0.82] },
          // Dot 1: bounces second (0.14-0.28), pops second (0.50-0.70)
          { times: [0, 0.14, 0.28, 0.5, 0.62, 0.7], burstTimes: [0, 0.28, 0.4, 0.5, 0.62, 0.74] },
          // Dot 2: bounces third (0.20-0.34), pops first (0.42-0.62)
          {
            times: [0, 0.2, 0.34, 0.42, 0.54, 0.62],
            burstTimes: [0, 0.34, 0.38, 0.42, 0.54, 0.66],
          },
        ];

        return (
          <span
            className="ml-2 inline-flex items-end"
            style={{ gap: dotGap, height: '1.2em', verticalAlign: 'baseline' }}
          >
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="relative inline-block"
                style={{ width: dotSize, height: dotSize }}
              >
                {/* Main dot */}
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: animationColor }}
                  initial={{ y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    y: [0, '-0.15em', 0, 0, 0, 0],
                    scale: [1, 1.1, 1, 0.8, 0.3, 0],
                    opacity: [1, 1, 1, 1, 1, 0],
                  }}
                  transition={{
                    duration: cycleDuration,
                    delay,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatDelay: duration * 0.4,
                    times: dotTimings[index].times,
                  }}
                />
                {/* Burst rays that appear when popping */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <motion.span
                    key={angle}
                    className="absolute rounded-full"
                    style={{
                      width: '25%',
                      height: '25%',
                      backgroundColor: animationColor,
                      top: '50%',
                      left: '50%',
                      marginTop: '-12.5%',
                      marginLeft: '-12.5%',
                    }}
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 0, 0, 0, 1, 0.5],
                      opacity: [0, 0, 0, 0, 0.8, 0],
                      x: [
                        0,
                        0,
                        0,
                        0,
                        Math.cos((angle * Math.PI) / 180) * 12,
                        Math.cos((angle * Math.PI) / 180) * 18,
                      ],
                      y: [
                        0,
                        0,
                        0,
                        0,
                        Math.sin((angle * Math.PI) / 180) * 12,
                        Math.sin((angle * Math.PI) / 180) * 18,
                      ],
                    }}
                    transition={{
                      duration: cycleDuration,
                      delay,
                      ease: 'easeOut',
                      repeat: Infinity,
                      repeatDelay: duration * 0.4,
                      times: dotTimings[index].burstTimes,
                    }}
                  />
                ))}
              </span>
            ))}
          </span>
        );
      }

      default:
        return null;
    }
  };

  return (
    <span ref={ref} className="relative inline-block">
      {children}
      {renderAnimation()}
    </span>
  );
}
