'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { PageActionDef } from './types';

// ============================================================================
// Store (external store for useSyncExternalStore)
// ============================================================================

type Listener = () => void;

function createActionStore() {
  const actions = new Map<string, PageActionDef>();
  const listeners = new Set<Listener>();
  let snapshot: PageActionDef[] = [];

  function notify() {
    // Rebuild cached snapshot only on mutation — useSyncExternalStore
    // compares by reference, so getSnapshot must return the same object
    // when the data hasn't changed.
    snapshot = Array.from(actions.values());
    listeners.forEach((l) => l());
  }

  return {
    register(defs: PageActionDef[]) {
      for (const def of defs) {
        actions.set(def.key, def);
      }
      notify();
    },
    unregister(keys: string[]) {
      for (const key of keys) {
        actions.delete(key);
      }
      notify();
    },
    getSnapshot(): PageActionDef[] {
      return snapshot;
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// ============================================================================
// Context
// ============================================================================

type ActionStore = ReturnType<typeof createActionStore>;

const PageActionsCtx = createContext<ActionStore | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function PageActionsProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ActionStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createActionStore();
  }

  return <PageActionsCtx.Provider value={storeRef.current}>{children}</PageActionsCtx.Provider>;
}

// ============================================================================
// Hooks
// ============================================================================

function useStore() {
  const store = useContext(PageActionsCtx);
  if (!store) throw new Error('usePageActions must be used within <PageActionsProvider>');
  return store;
}

/**
 * Sort order: dynamic actions first (left), then static actions (right).
 * Within each group, tertiary → secondary → primary.
 * Dynamic-first prevents layout jumps when contextual buttons appear/disappear.
 */
const LIFECYCLE_ORDER: Record<string, number> = { dynamic: 0, static: 1 };
const VARIANT_ORDER: Record<string, number> = { tertiary: 0, secondary: 1, primary: 2 };

/**
 * Consumer hook — returns sorted, visible actions.
 * Re-renders only when the action list changes.
 */
export function usePageActions() {
  const store = useStore();
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  // Stable sorted array — sort by lifecycle (dynamic first), then variant
  const sorted = snapshot
    .filter((a) => a.visible !== false)
    .sort((a, b) => {
      const lifecycleDiff =
        (LIFECYCLE_ORDER[a.lifecycle ?? 'static'] ?? 1) -
        (LIFECYCLE_ORDER[b.lifecycle ?? 'static'] ?? 1);
      if (lifecycleDiff !== 0) return lifecycleDiff;
      return (
        (VARIANT_ORDER[a.variant ?? 'primary'] ?? 2) - (VARIANT_ORDER[b.variant ?? 'primary'] ?? 2)
      );
    });

  return sorted;
}

/**
 * Pages call this to register their actions.
 * Auto-registers on mount, auto-unregisters on unmount.
 * Updates when the actions array identity changes.
 */
export function useRegisterPageActions(actions: PageActionDef[]) {
  const store = useStore();

  const register = useCallback(() => {
    store.register(actions);
  }, [store, actions]);

  useEffect(() => {
    register();
    const keys = actions.map((a) => a.key);
    return () => store.unregister(keys);
  }, [store, actions, register]);
}
