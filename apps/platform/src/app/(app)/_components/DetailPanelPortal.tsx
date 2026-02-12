'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonDetailPanel, type PersonDetail } from './PersonDetailPanel';

interface DetailPanelPortalProps {
  person: PersonDetail | null;
  onClose: () => void;
  profileUrl?: string;
}

/**
 * Responsive detail panel that portals into `.app-grid`.
 *
 * - **Mobile:** Fixed drawer from the right with backdrop. Swipe right or tap
 *   backdrop to close (mirrors the navigation sidebar pattern).
 * - **Desktop (md+):** Grid-positioned panel with spring animation.
 *   Toggles `.detail-panel-open` on `.main-wrapper` to shrink the main area.
 */
export function DetailPanelPortal({ person, onClose, profileUrl }: DetailPanelPortalProps) {
  const [gridEl, setGridEl] = useState<HTMLElement | null>(null);

  // Find .app-grid for portaling
  useEffect(() => {
    const grid = document.querySelector('.app-grid');
    if (grid) setGridEl(grid as HTMLElement);
  }, []);

  // Toggle .detail-panel-open on the main wrapper
  useEffect(() => {
    const wrapper = document.querySelector('.main-wrapper');
    if (!wrapper) return;

    if (person) {
      wrapper.classList.add('detail-panel-open');
    } else {
      wrapper.classList.remove('detail-panel-open');
    }

    return () => {
      wrapper.classList.remove('detail-panel-open');
    };
  }, [person]);

  if (!gridEl) return null;

  return createPortal(
    <AnimatePresence>
      {person && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            key="detail-panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onClose}
          />

          {/* Mobile panel — swipe right to close */}
          <motion.div
            key="detail-panel-mobile"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.4 }}
            onDragEnd={(_e, info) => {
              if (info.offset.x > 80 || info.velocity.x > 300) {
                onClose();
              }
            }}
            className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-96 overflow-hidden shadow-2xl md:hidden"
          >
            <div className="h-full overflow-y-auto">
              <PersonDetailPanel person={person} onClose={onClose} profileUrl={profileUrl} />
            </div>
          </motion.div>

          {/* Desktop panel — spring animation, grid-positioned */}
          <motion.div
            key="detail-panel-desktop"
            initial={{ x: '105%', y: 12, scale: 0.96 }}
            animate={{ x: 0, y: 0, scale: 1 }}
            exit={{ x: '105%', y: 12, scale: 0.96 }}
            transition={{
              type: 'spring',
              damping: 22,
              stiffness: 260,
              mass: 0.8,
            }}
            className="z-40 mt-4 mr-3 hidden max-h-[calc(100%-2rem)] w-96 self-start justify-self-end overflow-hidden shadow-2xl [grid-area:main] md:block"
            style={{ transformOrigin: 'top right' }}
          >
            <div className="max-h-[inherit] overflow-y-auto">
              <PersonDetailPanel person={person} onClose={onClose} profileUrl={profileUrl} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    gridEl
  );
}
