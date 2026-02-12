'use client';

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wrench } from 'lucide-react';
import { ResponsiveSheet, SheetPage } from '../components/ResponsiveSheet';
import { usePageActions } from './PageActionsContext';
import { ActionSheet } from './ActionSheet';

/** Max icons to show individually before collapsing to a generic icon */
const MAX_VISIBLE_ICONS = 4;

const BRAND_GREEN_GRADIENT = 'linear-gradient(135deg, #aad43c 0%, #8bc34a 100%)';

function ActionsHeader() {
  return (
    <div
      className="relative overflow-hidden px-4 pt-4 pb-6 md:px-8 md:pt-6 md:pb-8"
      style={{ background: BRAND_GREEN_GRADIENT }}
    >
      {/* Mobile drag handle */}
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>

      {/* Wrench icon watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <Wrench className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      {/* Title */}
      <div className="relative z-10">
        <h2 className="text-xl font-bold tracking-wide text-white uppercase md:text-2xl">
          Actions
        </h2>
        <p className="mt-1 text-sm text-white/70 uppercase">Quick actions for this page</p>
      </div>
    </div>
  );
}

/**
 * Mobile action bar + action sheet.
 *
 * - 0 visible non-selfRendered actions → nothing renders
 * - 1 action → single bar, executes directly on tap
 * - 2+ actions → bar showing all action icons, opens ResponsiveSheet
 *
 * Width animates smoothly when actions are added/removed (e.g. tab switch).
 * Renders via portal to document.body. `md:hidden` ensures mobile only.
 */
export function MobileActionBar() {
  const allActions = usePageActions();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter to renderable actions (visible + not self-rendered)
  const actions = useMemo(() => allActions.filter((a) => !a.selfRendered), [allActions]);

  // Check if any action has an active badge
  const hasAnyBadge = useMemo(() => actions.some((a) => a.badge != null && a.badge > 0), [actions]);

  // Measure natural width of inner content for animated transitions
  useLayoutEffect(() => {
    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    setBarWidth(Math.round(rect.width));
  }, [actions, hasAnyBadge]);

  if (!mounted || actions.length === 0) return null;

  const showIcons = actions.length <= MAX_VISIBLE_ICONS;
  const isSingle = actions.length === 1;
  const primaryAction = actions[actions.length - 1];

  const handleClick = () => {
    if (isSingle) {
      primaryAction.onAction();
    } else {
      setSheetOpen(true);
    }
  };

  return createPortal(
    <div className="md:hidden">
      {/* Centering wrapper — fixed positioning + flexbox center */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[55] flex justify-center"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Button — animates width, breathes via scale */}
        <button
          onClick={handleClick}
          aria-label={isSingle ? primaryAction.label : 'Open actions'}
          className="action-bar-breathe bg-secondary dark:bg-primary dark:text-primary-foreground pointer-events-auto flex h-12 items-center justify-center overflow-hidden shadow-[0_6px_28px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.25)] transition-[width] duration-300 ease-out active:scale-95"
          style={{ width: barWidth ? `${barWidth}px` : 'auto' }}
        >
          <div ref={innerRef} className="flex shrink-0 items-center px-4">
            {showIcons ? (
              actions.map((action) => {
                const Icon = action.icon;
                const hasBadge = action.badge != null && action.badge > 0;
                return (
                  <span
                    key={action.key}
                    className="relative flex h-5 w-8 items-center justify-center"
                  >
                    <Icon className="dark:text-primary-foreground h-5 w-5 text-white/80" />
                    {hasBadge && (
                      <span className="bg-primary dark:bg-foreground absolute -top-1.5 -right-0.5 h-2 w-2 rounded-full" />
                    )}
                  </span>
                );
              })
            ) : (
              <>
                <span className="relative flex h-5 w-8 items-center justify-center">
                  <Wrench className="dark:text-primary-foreground h-5 w-5 text-white/80" />
                  {hasAnyBadge && (
                    <span className="bg-primary dark:bg-foreground absolute -top-1.5 -right-0.5 h-2 w-2 rounded-full" />
                  )}
                </span>
                <span className="dark:text-primary-foreground text-xs font-semibold tracking-wide text-white/80 uppercase">
                  Actions
                </span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Action Sheet — ResponsiveSheet with green gradient header */}
      {!isSingle && (
        <ResponsiveSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          panelClassName="bg-card overflow-hidden"
          maxWidth="max-w-lg"
          noPanelPadding
          header={<ActionsHeader />}
        >
          <SheetPage name="main">
            <ActionSheet actions={actions} onClose={() => setSheetOpen(false)} />
          </SheetPage>
        </ResponsiveSheet>
      )}

      <style>{breatheKeyframes}</style>
    </div>,
    document.body
  );
}

const breatheKeyframes = `
@keyframes actionBarBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
.action-bar-breathe {
  animation: actionBarBreathe 4s ease-in-out infinite;
}
.action-bar-breathe:active {
  animation: none;
}
`;
