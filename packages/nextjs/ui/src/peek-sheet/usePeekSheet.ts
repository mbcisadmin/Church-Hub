'use client';

import { createContext, useContext } from 'react';

export interface PeekSheetContextValue {
  state: 'peek' | 'expanded';
  mode: 'sheet' | 'modal';
  collapse: () => void;
  expand: () => void;
}

export const PeekSheetContext = createContext<PeekSheetContextValue | null>(null);

/**
 * Hook for child components to access PeekSheet state and controls.
 * Returns null if not inside a PeekSheet.
 */
export function usePeekSheet(): PeekSheetContextValue | null {
  return useContext(PeekSheetContext);
}
