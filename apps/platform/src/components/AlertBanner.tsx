'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type CriticalAlert = {
  id: string;
  message: string;
  type: 'warning' | 'danger' | 'info';
  actionLabel?: string;
  actionUrl?: string;
  expiresAt?: Date;
};

// Mock data - will be replaced with API call
const MOCK_ALERTS: CriticalAlert[] = [
  {
    id: '1',
    message: 'Small groups cancelled tonight due to weather',
    type: 'warning',
    expiresAt: new Date('2026-02-09'),
  },
];

const BANNER_HEIGHT = '48px';
const STORAGE_KEY = 'dismissed-alerts';

function getGradient(type: CriticalAlert['type']) {
  switch (type) {
    case 'danger':
      return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    case 'warning':
      return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    case 'info':
      return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    default:
      return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
  }
}

function getIcon(type: CriticalAlert['type']) {
  switch (type) {
    case 'danger':
      return <AlertCircle className="h-5 w-5" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5" />;
    case 'info':
      return <Info className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
}

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed alerts from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDismissedIds(JSON.parse(stored));
      } catch {
        setDismissedIds([]);
      }
    }

    // Filter alerts: not dismissed and not expired
    const now = new Date();
    const activeAlerts = MOCK_ALERTS.filter((alert) => {
      if (alert.expiresAt && new Date(alert.expiresAt) < now) return false;
      return true;
    });
    setAlerts(activeAlerts);
  }, []);

  const handleDismiss = (alertId: string) => {
    const newDismissed = [...dismissedIds, alertId];
    setDismissedIds(newDismissed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDismissed));
  };

  // Get the first non-dismissed alert to show
  const activeAlert = alerts.find((alert) => !dismissedIds.includes(alert.id));

  if (!activeAlert) {
    return null;
  }

  return (
    <div
      className="fixed right-0 left-0 z-[45] text-white shadow-lg"
      style={{
        top: '64px',
        height: BANNER_HEIGHT,
        background: getGradient(activeAlert.type),
      }}
    >
      <div className="mx-auto h-full max-w-[1600px] px-4 md:px-6 lg:px-8">
        <div className="flex h-full w-full items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon(activeAlert.type)}
            <p className="text-sm font-medium">{activeAlert.message}</p>
            {activeAlert.actionLabel && activeAlert.actionUrl && (
              <a
                href={activeAlert.actionUrl}
                className="ml-2 text-sm font-semibold underline underline-offset-2 hover:no-underline"
              >
                {activeAlert.actionLabel}
              </a>
            )}
          </div>

          <button
            onClick={() => handleDismiss(activeAlert.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
