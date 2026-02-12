'use client';

import { useSearchParams } from 'next/navigation';

export type AccessLevel = 'low' | 'medium' | 'high';

export interface TestingParams {
  /** Access level override for testing different permission levels */
  accessLevel: AccessLevel | null;
  /** Whether PWA/app mode is enabled (shows bottom tabs) */
  isPWAMode: boolean;
}

/**
 * Hook for reading testing query parameters.
 *
 * Query params:
 * - `?access=low|medium|high` - Override access level for testing
 * - `?mode=pwa` - Enable PWA mode with bottom tabs
 *
 * @example
 * ```tsx
 * const { accessLevel, isPWAMode } = useTestingParams();
 *
 * // Filter items based on access level
 * const visibleApps = accessLevel === 'low'
 *   ? apps.slice(0, 2)
 *   : accessLevel === 'medium'
 *   ? apps.slice(0, 5)
 *   : apps;
 * ```
 */
export function useTestingParams(): TestingParams {
  const searchParams = useSearchParams();

  const accessParam = searchParams.get('access');
  const modeParam = searchParams.get('mode');

  const accessLevel: AccessLevel | null =
    accessParam === 'low' || accessParam === 'medium' || accessParam === 'high'
      ? accessParam
      : null;

  const isPWAMode = modeParam === 'pwa';

  return {
    accessLevel,
    isPWAMode,
  };
}

/**
 * Helper to filter items based on access level.
 * Returns a subset of items based on the access level.
 *
 * @param items - Array of items to filter
 * @param accessLevel - Current access level (null = show all)
 * @param limits - Number of items to show per level { low, medium }
 */
export function filterByAccessLevel<T>(
  items: T[],
  accessLevel: AccessLevel | null,
  limits: { low: number; medium: number } = { low: 2, medium: 5 }
): T[] {
  if (!accessLevel) return items;

  switch (accessLevel) {
    case 'low':
      return items.slice(0, limits.low);
    case 'medium':
      return items.slice(0, limits.medium);
    case 'high':
    default:
      return items;
  }
}
