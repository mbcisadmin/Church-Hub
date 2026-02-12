'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface TabReadyContextValue {
  isReady: (tab: string) => boolean;
  markReady: (tab: string) => void;
  activeTab: string | null;
  setActiveTab: (tab: string) => void;
}

const TabReadyContext = createContext<TabReadyContextValue | null>(null);

export function TabReadyProvider({ children }: { children: ReactNode }) {
  const [readyTabs, setReadyTabs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const isReady = useCallback((tab: string) => readyTabs.has(tab), [readyTabs]);

  const markReady = useCallback((tab: string) => {
    setReadyTabs((prev) => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  }, []);

  return (
    <TabReadyContext.Provider value={{ isReady, markReady, activeTab, setActiveTab }}>
      {children}
    </TabReadyContext.Provider>
  );
}

export function useTabReady() {
  const ctx = useContext(TabReadyContext);
  if (!ctx) throw new Error('useTabReady must be used within TabReadyProvider');
  return ctx;
}
