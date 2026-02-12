'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useTestingParams, type AccessLevel } from '@/lib/useTestingParams';
import PWABottomTabs from './PWABottomTabs';

interface TestingParamsContextValue {
  accessLevel: AccessLevel | null;
  isPWAMode: boolean;
}

const TestingParamsContext = createContext<TestingParamsContextValue>({
  accessLevel: null,
  isPWAMode: false,
});

/**
 * Hook to access testing params from any component.
 */
export function useTestingContext() {
  return useContext(TestingParamsContext);
}

interface TestingParamsProviderProps {
  children: ReactNode;
}

/**
 * Provider that reads testing query params and provides them via context.
 * Also conditionally renders PWA bottom tabs when in PWA mode.
 *
 * Usage:
 * - `?access=low` - Show minimal items (new volunteer)
 * - `?access=medium` - Show moderate items (regular staff)
 * - `?access=high` - Show all items (admin)
 * - `?mode=pwa` - Show bottom tab navigation
 *
 * Combine: `?access=medium&mode=pwa`
 */
export function TestingParamsProvider({ children }: TestingParamsProviderProps) {
  const { accessLevel, isPWAMode } = useTestingParams();

  return (
    <TestingParamsContext.Provider value={{ accessLevel, isPWAMode }}>
      {/* Add padding at bottom when PWA mode is active to account for tabs */}
      <div className={isPWAMode ? 'pb-20' : ''}>{children}</div>
      {isPWAMode && <PWABottomTabs />}
    </TestingParamsContext.Provider>
  );
}
