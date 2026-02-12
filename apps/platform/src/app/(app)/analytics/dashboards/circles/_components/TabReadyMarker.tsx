'use client';

import { useEffect } from 'react';
import { useTabReady } from './TabReadyProvider';

export default function TabReadyMarker({ tab }: { tab: string }) {
  const { markReady } = useTabReady();

  useEffect(() => {
    markReady(tab);
  }, [tab, markReady]);

  return null;
}
