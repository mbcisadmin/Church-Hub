'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

export interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

export interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

const EXPANDED_RADIUS = 60;
const FAN_ARC_DEG = 120;
const SPRING = { stiffness: 400, damping: 22, mass: 0.8 };
const STAGGER_OPEN = 0.03;
const STAGGER_CLOSE = 0.02;

// Collapsed layout
const COLLAPSED_SPACING = 24;
const COLLAPSED_SIZE = 18;
// Expanded layout
const EXPANDED_SIZE = 44;

function getAngle(index: number, total: number): number {
  // Fan downward: left icon → left+down, right icon → right+down
  const endAngle = 90 + FAN_ARC_DEG / 2;
  const step = total > 1 ? FAN_ARC_DEG / (total - 1) : 0;
  return (endAngle - step * index) * (Math.PI / 180);
}

function getExpandedPos(index: number, total: number) {
  const angle = getAngle(index, total);
  return {
    x: Math.cos(angle) * EXPANDED_RADIUS,
    y: Math.sin(angle) * EXPANDED_RADIUS,
  };
}

function getCollapsedPos(index: number, total: number) {
  const centerIndex = (total - 1) / 2;
  const x = (index - centerIndex) * COLLAPSED_SPACING;
  // Downward arc: center icon sits lower, edges higher
  const maxDist = centerIndex || 1;
  const distFromCenter = Math.abs(index - centerIndex);
  const y = (1 - distFromCenter / maxDist) * 5;
  // Perspective: outer icons slightly smaller
  const scale = 1 - (distFromCenter / maxDist) * 0.15;
  return { x, y, scale };
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  const totalWidth = (actions.length - 1) * COLLAPSED_SPACING + COLLAPSED_SIZE;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={close}
          />
        )}
      </AnimatePresence>

      <div className={cn('relative z-50', className)} style={{ width: totalWidth, height: 40 }}>
        {/* Collapsed tap target — covers the icon cluster */}
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute inset-0 z-10"
            aria-label="Open quick actions"
            aria-expanded={false}
          />
        )}

        {/* Close button — fades in at origin when expanded */}
        <AnimatePresence>
          {open && (
            <motion.button
              type="button"
              onClick={close}
              className="absolute flex items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
              style={{
                left: '50%',
                top: '50%',
                width: COLLAPSED_SIZE,
                height: COLLAPSED_SIZE,
                marginLeft: -COLLAPSED_SIZE / 2,
                marginTop: -COLLAPSED_SIZE / 2,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15, delay: 0.08 }}
              aria-label="Close quick actions"
            >
              <X className="h-[18px] w-[18px]" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Single set of icons — animate between collapsed ↔ expanded */}
        {actions.map((action, i) => {
          const cPos = getCollapsedPos(i, actions.length);
          const ePos = getExpandedPos(i, actions.length);
          const Icon = action.icon;
          const reverseIndex = actions.length - 1 - i;
          const size = open ? EXPANDED_SIZE : COLLAPSED_SIZE;
          const delay = open ? STAGGER_OPEN * i : STAGGER_CLOSE * reverseIndex;

          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: '50%', top: '50%' }}
              animate={{
                x: (open ? ePos.x : cPos.x) - size / 2,
                y: (open ? ePos.y : cPos.y) - size / 2,
                scale: open ? 1 : cPos.scale,
              }}
              transition={{ type: 'spring', ...SPRING, delay }}
            >
              <motion.button
                type="button"
                onClick={() => {
                  if (open) {
                    action.onClick();
                    close();
                  }
                }}
                className={cn(
                  'flex items-center justify-center rounded-full',
                  open
                    ? 'bg-secondary text-secondary-foreground shadow-lg hover:brightness-125'
                    : 'text-white'
                )}
                animate={{
                  width: size,
                  height: size,
                }}
                transition={{ type: 'spring', ...SPRING, delay }}
                aria-label={action.label}
                tabIndex={open ? 0 : -1}
                style={{ pointerEvents: open ? 'auto' : 'none' }}
              >
                <motion.span
                  animate={{ opacity: action.isActive || open ? 1 : 0.6 }}
                  transition={{ duration: 0.15 }}
                  className={cn(action.isActive && 'text-primary')}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </motion.span>
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
