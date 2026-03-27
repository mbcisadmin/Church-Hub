'use client';

import { useEffect, useRef } from 'react';

interface TrackParams {
  resultType: string;
  resultId: string;
  resultTitle: string;
  resultSubtitle?: string;
  resultRoute: string;
  resultIcon?: string;
  resultImageUrl?: string;
}

/**
 * Tracks a page visit by calling POST /api/search/track.
 * Pass `null` to skip tracking (e.g. while data is loading).
 * Fires once per resultId change, fire-and-forget.
 */
export function useTrackPageVisit(params: TrackParams | null) {
  const lastTrackedId = useRef<string | null>(null);

  useEffect(() => {
    if (!params || params.resultId === lastTrackedId.current) return;
    lastTrackedId.current = params.resultId;

    fetch('/api/search/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).catch(() => {});
  }, [params?.resultId]);
}
