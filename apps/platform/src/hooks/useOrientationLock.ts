'use client';

import { useEffect, useCallback } from 'react';

function lockOrientation(orientation: string) {
  try {
    const so = screen?.orientation as { lock?: (o: string) => Promise<void> } | undefined;
    if (so?.lock) {
      so.lock(orientation).catch(() => {});
    }
  } catch {}
}

function unlockOrientation() {
  try {
    const so = screen?.orientation as { unlock?: () => void } | undefined;
    if (so?.unlock) {
      so.unlock();
    }
  } catch {}
}

export function useOrientationLock() {
  useEffect(() => {
    lockOrientation('portrait-primary');
    return () => unlockOrientation();
  }, []);

  const unlock = useCallback(() => {
    lockOrientation('any');
  }, []);

  const lock = useCallback(() => {
    lockOrientation('portrait-primary');
  }, []);

  return { unlock, lock };
}
