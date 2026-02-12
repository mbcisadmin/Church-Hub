'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  /** App name displayed in the install prompt */
  appName?: string;
}

export default function PWAInstallPrompt({ appName = 'The Hub' }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isFirefox, setIsFirefox] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);

  useEffect(() => {
    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if browser is Firefox
    const firefox = /Firefox/i.test(navigator.userAgent);
    setIsFirefox(firefox);

    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if user dismissed the prompt this session (client-side only)
    // Using v2 key to reset any dismissals from old prompt design
    const dismissed = sessionStorage.getItem('pwa-prompt-dismissed-v2') === 'true';
    setIsDismissed(dismissed);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('PWA: beforeinstallprompt event fired');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Debug logging
    console.log('PWA Prompt Status:', {
      isIOS: iOS,
      isFirefox: firefox,
      isStandalone: standalone,
      dismissed,
      userAgent: navigator.userAgent,
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    setIsDismissed(true);
    // Remember dismissal for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-prompt-dismissed-v2', 'true');
    }
  };

  const handleShareClick = async () => {
    // Try to trigger the native share sheet (iOS/Android)
    if (navigator.share) {
      try {
        await navigator.share({
          title: appName,
          text: `Check out ${appName}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', err);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
    const diff = touchCurrentY.current - touchStartY.current;

    // Only allow downward swipe
    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    // Dismiss if swiped down more than 50px
    if (translateY > 50) {
      handleDismiss();
    }
    setTranslateY(0);
  };

  // Don't show if already installed or dismissed this session
  if (isStandalone || isDismissed) return null;

  // Don't show for Firefox - it doesn't natively support PWA installation
  if (isFirefox) return null;

  // Show iOS instructions
  if (isIOS && !isStandalone) {
    return (
      <div className="pointer-events-none fixed right-4 bottom-4 left-4 z-50 flex justify-center">
        <div
          className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-white/30 bg-white/40 p-5 shadow-2xl backdrop-blur-xl transition-transform dark:border-[oklch(0.3_0.005_0)] dark:bg-[oklch(0.16_0.005_0)]/95"
          style={{ transform: `translateY(${translateY}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 items-start gap-4">
              <div className="bg-primary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-md">
                <Download className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground mb-1 text-lg font-bold">Install {appName}</h3>
                <p className="text-muted-foreground text-sm">
                  Tap the{' '}
                  <button
                    onClick={handleShareClick}
                    className="text-primary dark:text-primary inline-flex items-center gap-1 font-medium hover:underline"
                  >
                    share button 📤
                  </button>{' '}
                  and select &quot;Add to Home Screen&quot; for quick access.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show Android/Chrome install prompt
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="pointer-events-none fixed right-4 bottom-4 left-4 z-50 flex justify-center">
        <div
          className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-white/30 bg-white/40 p-5 shadow-2xl backdrop-blur-xl transition-transform dark:border-[oklch(0.3_0.005_0)] dark:bg-[oklch(0.16_0.005_0)]/95"
          style={{ transform: `translateY(${translateY}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-4">
              <div className="bg-primary flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-md">
                <Download className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-foreground mb-0.5 text-lg font-bold">Install {appName}</h3>
                <p className="text-muted-foreground text-sm">
                  Add to your home screen for quick access
                </p>
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-primary hover:bg-primary/90 rounded-lg px-6 py-2.5 font-semibold text-white shadow-md transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground rounded-lg p-2.5 transition-colors hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
