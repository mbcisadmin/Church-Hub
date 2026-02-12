'use client';

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
  type RefObject,
} from 'react';
import { useSwipeGesture } from '../swipeable-primitives';

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface SwipeableContextValue {
  tabs: Tab[];
  activeTab: string;
  activeIndex: number;
  /** Live pixel offset during drag */
  dragOffset: number;
  isDragging: boolean;
  goNext: () => void;
  goPrev: () => void;
  /** Ref for SwipeableTabs to attach to its container */
  tabsRef: RefObject<HTMLDivElement | null>;
  /** Ref for SwipeableContent to attach to its wrapper */
  contentRef: RefObject<HTMLDivElement | null>;
}

const SwipeableContext = createContext<SwipeableContextValue | null>(null);

export function useSwipeableContext(): SwipeableContextValue | null {
  return useContext(SwipeableContext);
}

interface SwipeableProviderProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export function SwipeableProvider({
  tabs,
  activeTab,
  onTabChange,
  children,
}: SwipeableProviderProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  const goNext = useCallback(() => {
    for (let i = activeIndex + 1; i < tabs.length; i++) {
      if (!tabs[i].disabled) {
        onTabChange(tabs[i].id);
        return;
      }
    }
  }, [activeIndex, tabs, onTabChange]);

  const goPrev = useCallback(() => {
    for (let i = activeIndex - 1; i >= 0; i--) {
      if (!tabs[i].disabled) {
        onTabChange(tabs[i].id);
        return;
      }
    }
  }, [activeIndex, tabs, onTabChange]);

  const additionalRefs = useMemo(() => [contentRef], []);

  const { dragOffset, isDragging } = useSwipeGesture({
    containerRef: tabsRef,
    additionalRefs,
    activeIndex,
    itemCount: tabs.length,
    onNext: goNext,
    onPrev: goPrev,
  });

  const value = useMemo(
    () => ({
      tabs,
      activeTab,
      activeIndex,
      dragOffset,
      isDragging,
      goNext,
      goPrev,
      tabsRef,
      contentRef,
    }),
    [tabs, activeTab, activeIndex, dragOffset, isDragging, goNext, goPrev]
  );

  return <SwipeableContext.Provider value={value}>{children}</SwipeableContext.Provider>;
}
