'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Query params that should be preserved across navigation.
 * These are testing/demo params that shouldn't be lost when clicking links.
 */
const PRESERVED_PARAMS = ['access', 'mode'];

/**
 * Hook that provides a function to build URLs with preserved query params.
 * Use this when navigating to ensure testing params like `?access=low&mode=pwa` persist.
 */
export function usePreserveParams() {
  const searchParams = useSearchParams();

  /**
   * Build a URL with preserved query params appended.
   */
  const buildUrl = useCallback(
    (path: string): string => {
      // If it's an external URL, don't modify it
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }

      // Get current preserved params
      const preserved = new URLSearchParams();
      PRESERVED_PARAMS.forEach((param) => {
        const value = searchParams.get(param);
        if (value) {
          preserved.set(param, value);
        }
      });

      // If no params to preserve, return path as-is
      if (preserved.toString() === '') {
        return path;
      }

      // Parse the path to handle existing query params
      const [basePath, existingQuery] = path.split('?');
      const finalParams = new URLSearchParams(existingQuery || '');

      // Add preserved params (don't override if path already has them)
      preserved.forEach((value, key) => {
        if (!finalParams.has(key)) {
          finalParams.set(key, value);
        }
      });

      return `${basePath}?${finalParams.toString()}`;
    },
    [searchParams]
  );

  return { buildUrl };
}
