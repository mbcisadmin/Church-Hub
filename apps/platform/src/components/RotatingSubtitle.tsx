'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_MESSAGES = [
  'Serving Jesus, one task at a time.',
  'What brings you here today?',
  'Building His Church, together.',
  "We're glad you're here!",
];

const ROTATION_INTERVAL = 4000; // 4 seconds per message

interface RotatingSubtitleProps {
  className?: string;
  /** Custom messages to rotate through (defaults to home page messages) */
  messages?: string[];
  /** Delay in milliseconds before the first message appears */
  initialDelay?: number;
}

/**
 * Slot machine style rotating subtitle that cycles through messages.
 * Used on the home page to add warmth and variety to the greeting.
 */
export function RotatingSubtitle({
  className = 'h-6',
  messages = DEFAULT_MESSAGES,
  initialDelay = 0,
}: RotatingSubtitleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(initialDelay === 0);

  useEffect(() => {
    // Handle initial delay before showing first message
    if (initialDelay > 0) {
      const delayTimer = setTimeout(() => {
        setIsVisible(true);
      }, initialDelay);
      return () => clearTimeout(delayTimer);
    }
  }, [initialDelay]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.p
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{
              y: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="text-muted-foreground text-sm tracking-widest uppercase md:text-base"
          >
            {messages[currentIndex]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
