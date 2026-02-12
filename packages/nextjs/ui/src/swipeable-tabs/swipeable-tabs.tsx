'use client';

import { useRef, useCallback, type CSSProperties } from 'react';
import { SwipeableArch, SwipeIndicators, useSwipeGesture } from '../swipeable-primitives';
import { useSwipeableContext } from './SwipeableContext';

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface SwipeableTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  showArch?: boolean;
  archGradientColor?: string;
  archGradientColorDark?: string;
  showChevrons?: boolean;
}

/**
 * A mobile-friendly swipeable tab selector with 3D arc effect.
 *
 * Features:
 * - Swipe left/right to change tabs (via native touch events)
 * - Tabs arc outward like a carousel/clock face with CSS transitions
 * - Active tab underline indicator
 * - Supports disabled tabs
 * - Auto-detects SwipeableProvider context for coordinated swipe with content
 */
export function SwipeableTabs({
  tabs: propTabs,
  activeTab: propActiveTab,
  onTabChange: propOnTabChange,
  className = '',
  showArch = false,
  archGradientColor,
  archGradientColorDark,
  showChevrons = true,
}: SwipeableTabsProps) {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const ctx = useSwipeableContext();

  // Use context values if available, otherwise use props
  const tabs = ctx?.tabs ?? propTabs;
  const activeTab = ctx?.activeTab ?? propActiveTab;
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  const handleNext = useCallback(() => {
    if (ctx) {
      ctx.goNext();
    } else {
      for (let i = activeIndex + 1; i < tabs.length; i++) {
        if (!tabs[i].disabled) {
          propOnTabChange(tabs[i].id);
          return;
        }
      }
    }
  }, [ctx, activeIndex, tabs, propOnTabChange]);

  const handlePrev = useCallback(() => {
    if (ctx) {
      ctx.goPrev();
    } else {
      for (let i = activeIndex - 1; i >= 0; i--) {
        if (!tabs[i].disabled) {
          propOnTabChange(tabs[i].id);
          return;
        }
      }
    }
  }, [ctx, activeIndex, tabs, propOnTabChange]);

  // Standalone mode: local gesture hook when not inside a provider
  const standaloneGesture = useSwipeGesture({
    containerRef: localContainerRef,
    activeIndex,
    itemCount: tabs.length,
    onNext: handleNext,
    onPrev: handlePrev,
    disabled: !!ctx,
  });

  // Drag state: from context if in provider, otherwise from local gesture
  const dragOffset = ctx?.dragOffset ?? standaloneGesture.dragOffset;
  const isDragging = ctx?.isDragging ?? standaloneGesture.isDragging;

  // Container ref: from context if in provider, otherwise local
  const containerRef = ctx?.tabsRef ?? localContainerRef;

  // Calculate CSS transform for each tab — arc effect matching DateSwiper
  const getTabStyle = (index: number): CSSProperties => {
    const position = index - activeIndex;
    const dragInfluence = isDragging ? dragOffset / 200 : 0;
    const adjustedPosition = position + dragInfluence;

    const translateX = adjustedPosition * 90;
    const translateY = Math.abs(adjustedPosition) * 8;
    const scale = 1 - Math.abs(adjustedPosition) * 0.25;
    const opacity = Math.max(0.15, 1 - Math.abs(adjustedPosition) * 0.7);

    return {
      transform: `translateX(${translateX}%) translateY(${translateY}px) scale(${scale})`,
      opacity,
      fontSize: index === activeIndex ? undefined : '0.75rem',
      zIndex: 10 - Math.abs(index - activeIndex),
      transition: isDragging ? 'none' : 'all 300ms ease-out',
    };
  };

  const canGoLeft = activeIndex > 0 && !tabs[activeIndex - 1]?.disabled;
  const canGoRight = activeIndex < tabs.length - 1 && !tabs[activeIndex + 1]?.disabled;

  const handleTabClick = useCallback(
    (tab: Tab) => {
      if (tab.disabled) return;
      propOnTabChange(tab.id);
    },
    [propOnTabChange]
  );

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-visible ${showArch ? 'mt-6 h-24' : 'h-20'} ${className}`}
    >
      {/* Optional decorative arch with gradient */}
      {showArch && (
        <SwipeableArch
          gradientColor={archGradientColor}
          gradientColorDark={archGradientColorDark}
        />
      )}

      {/* Chevron navigation indicators (desktop) */}
      {showChevrons && (
        <SwipeIndicators
          canGoLeft={canGoLeft}
          canGoRight={canGoRight}
          onLeft={handlePrev}
          onRight={handleNext}
          bottomOffset={showArch ? -0.5 : 0}
          className="hidden lg:block"
        />
      )}

      {/* Tab labels */}
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            disabled={tab.disabled}
            className={`absolute flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-wider uppercase select-none ${
              isActive
                ? 'text-foreground'
                : tab.disabled
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-muted-foreground'
            }`}
            style={getTabStyle(index)}
          >
            <span className={isActive ? 'border-primary border-b-2 pb-0.5' : ''}>{tab.label}</span>
            {/* Loading spinner for disabled (loading) tabs */}
            {tab.disabled && (
              <span className="border-muted-foreground/40 h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
