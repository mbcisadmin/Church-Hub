'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface FullscreenChartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  controls?: ReactNode;
  legend?: ReactNode;
}

export default function FullscreenChartOverlay({
  isOpen,
  onClose,
  title,
  children,
  controls,
  legend,
}: FullscreenChartOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track orientation to apply CSS rotation in portrait
  useEffect(() => {
    if (!isOpen) return;
    const mq = window.matchMedia('(orientation: portrait)');
    setIsPortrait(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [isOpen]);

  // Try native landscape lock (works on Android PWA)
  const lockLandscape = useCallback(() => {
    try {
      const so = screen?.orientation as { lock?: (o: string) => Promise<void> } | undefined;
      if (so?.lock) {
        so.lock('landscape').catch(() => {});
      }
    } catch {}
  }, []);

  const lockPortrait = useCallback(() => {
    try {
      const so = screen?.orientation as { lock?: (o: string) => Promise<void> } | undefined;
      if (so?.lock) {
        so.lock('portrait-primary').catch(() => {});
      }
    } catch {}
  }, []);

  // Request browser fullscreen (hides URL bar + toolbar on Android)
  const enterFullscreen = useCallback(() => {
    try {
      const el = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
      };
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } catch {}
  }, []);

  const exitFullscreen = useCallback(() => {
    try {
      const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void>;
        webkitFullscreenElement?: Element | null;
      };
      if (doc.fullscreenElement) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitFullscreenElement) {
        doc.webkitExitFullscreen?.();
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) {
      lockLandscape();
      enterFullscreen();
    } else {
      lockPortrait();
      exitFullscreen();
    }
  }, [isOpen, lockLandscape, lockPortrait, enterFullscreen, exitFullscreen]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Trigger Chart.js resize when overlay opens or orientation changes
  useEffect(() => {
    if (!isOpen) return;
    const triggerResize = () => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    };
    // Delay slightly for CSS rotation / fullscreen to settle
    const timer = setTimeout(triggerResize, 150);
    return () => clearTimeout(timer);
  }, [isOpen, isPortrait]);

  if (!mounted || !isOpen) return null;

  // Use dvh/dvw (dynamic viewport units) to account for mobile browser chrome.
  // Falls back to vh/vw in browsers that don't support dvh/dvw.
  const rotateStyle = isPortrait
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100dvh',
        height: '100dvw',
        transform: 'rotate(90deg)',
        transformOrigin: 'top left',
        marginLeft: '100dvw',
        zIndex: 100,
      }
    : {
        position: 'fixed' as const,
        inset: 0,
        zIndex: 100,
      };

  const hasSidebar = !!(controls || legend);

  return createPortal(
    <div style={rotateStyle} className="bg-background flex h-full flex-col">
      {/* Top header bar */}
      <div className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-2">
        <button
          onClick={onClose}
          className="hover:bg-muted flex h-8 w-8 items-center justify-center rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="flex-1 text-sm font-semibold tracking-wide uppercase">{title}</h2>
      </div>

      {/* Content: chart left, sidebar right */}
      <div className="flex min-h-0 flex-1">
        {/* Chart area — fills remaining space, overflow hidden to constrain Chart.js */}
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden p-3">{children}</div>

        {/* Sidebar: controls + legend */}
        {hasSidebar && (
          <div className="border-border flex w-56 shrink-0 flex-col justify-between overflow-y-auto border-l p-3">
            <div>{controls}</div>
            <div>{legend}</div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
