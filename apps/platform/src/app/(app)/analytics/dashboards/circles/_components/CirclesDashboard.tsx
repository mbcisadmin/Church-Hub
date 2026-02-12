'use client';

import {
  useState,
  useEffect,
  useCallback,
  useTransition,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useTheme } from 'next-themes';
import { BarChart3, ChevronDown, Pin, Search, Plus } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { Chart as ChartJS } from 'chart.js';
import {
  SwipeableTabs,
  SwipeableProvider,
  SwipeableContent,
} from '@church/nextjs-ui/swipeable-tabs';
import OverTimeTab from './tabs/OverTimeTab';
import { CircleDrawEffect } from './CircleDrawEffect';
import { RotatingSubtitle } from '@/components/RotatingSubtitle';
import { useTabReady } from './TabReadyProvider';
import { getOverTimeData } from '../_data/actions';
import type { OverTimeData } from '../_data/types';

type Tab = 'over-time' | 'current' | 'milestones';

const hiddenStyle = {
  display: 'none' as const,
};

const fadeUpStyle: CSSProperties = {
  animation: 'circlesTabFadeUp 350ms ease-out',
};

interface CirclesDashboardProps {
  overTimeData: OverTimeData;
  currentSlot: ReactNode;
  milestonesSlot: ReactNode;
}

export default function CirclesDashboard({
  overTimeData: initialData,
  currentSlot,
  milestonesSlot,
}: CirclesDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('over-time');
  const [overTimeData, setOverTimeData] = useState(initialData);
  const [selectedPeriodId, setSelectedPeriodId] = useState(initialData.selectedPeriodId);
  const [isPending, startTransition] = useTransition();
  const { resolvedTheme } = useTheme();
  const { isReady, setActiveTab: setContextActiveTab } = useTabReady();

  // Sync Chart.js default text color with current theme
  useEffect(() => {
    ChartJS.defaults.color = resolvedTheme === 'dark' ? '#a1a1aa' : '#666666';
  }, [resolvedTheme]);

  // Dropdown options derived from API data, most recent first
  const periodOptions = useMemo(
    () => [...initialData.fiscalPeriods].reverse(),
    [initialData.fiscalPeriods]
  );

  // Group periods by year for optgroup display
  const periodsByYear = useMemo(() => {
    const groups: { year: string; periods: typeof periodOptions }[] = [];
    let currentYear = '';

    for (const period of periodOptions) {
      // Extract year from label (e.g., "January 2026" -> "2026")
      const yearMatch = period.label.match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : '';

      if (year !== currentYear) {
        currentYear = year;
        groups.push({ year, periods: [] });
      }
      groups[groups.length - 1].periods.push(period);
    }

    return groups;
  }, [periodOptions]);

  // Get the full label for the selected period (for display in closed select)
  // Use overTimeData.asOf as it's always in sync with the displayed data
  const selectedPeriodLabel = overTimeData.asOf;

  // Handle period change - fetch new data from server
  const handlePeriodChange = useCallback((newPeriodId: number) => {
    setSelectedPeriodId(newPeriodId);
    startTransition(async () => {
      const newData = await getOverTimeData(newPeriodId);
      setOverTimeData(newData);
    });
  }, []);

  // Dispatch resize event when switching tabs so Chart.js recalculates
  // dimensions for charts that were rendered inside display:none
  const switchTab = useCallback(
    (tab: Tab) => {
      if (tab !== 'over-time' && !isReady(tab)) return;
      setActiveTab(tab);
      setContextActiveTab(tab); // Sync to context for child components
      // Allow the DOM to update before dispatching resize
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    },
    [isReady, setContextActiveTab]
  );

  // Set initial active tab in context on mount
  useEffect(() => {
    setContextActiveTab(activeTab);
  }, []);

  // Register page actions for the unified mobile FAB / desktop header portal
  const pageActions = useMemo(
    () => [
      {
        key: 'pin',
        icon: Pin,
        label: 'Pin dashboard',
        variant: 'tertiary' as const,
        onAction: () => {
          /* TODO: Pin/unpin dashboard */
        },
      },
      {
        key: 'search',
        icon: Search,
        label: 'Search analytics',
        variant: 'secondary' as const,
        onAction: () => {
          /* TODO: Open search sheet scoped to Analytics */
        },
      },
      {
        key: 'request',
        icon: Plus,
        label: 'Request dashboard',
        variant: 'primary' as const,
        onAction: () => {
          /* TODO: Navigate to request page */
        },
      },
    ],
    []
  );
  useRegisterPageActions(pageActions);

  const swipeableTabs = useMemo(
    () => [
      { id: 'over-time', label: 'Over Time' },
      { id: 'current', label: 'Current', disabled: !isReady('current') },
      { id: 'milestones', label: 'Milestones', disabled: !isReady('milestones') },
    ],
    [isReady]
  );

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-0">
      {/* Header with action buttons */}
      <header>
        <SectionHeader
          title={<CircleDrawEffect>Circles</CircleDrawEffect>}
          subtitle={
            <RotatingSubtitle
              className="h-12 md:h-7"
              messages={[
                "Insight into where people are and where they're heading",
                'Community — the unchurched in the immediate area',
                'Crowd — everyone who shows up, regular service attendees',
                'Congregation — official members with a sense of ownership',
                'Committed — people who pray, give, and grow in discipleship',
                'Core — ministers and leaders driving the church forward',
              ]}
              initialDelay={3400}
            />
          }
          icon={BarChart3}
          variant="watermark"
          as="h1"
          className="mb-0"
          actions={
            /* Portal target for FilterBar's desktop trigger (rendered via PeekSheet triggerPortalId) */
            <>
              <div id="circles-filter-actions" />
              <DesktopActionBar />
            </>
          }
        />
      </header>

      <SwipeableProvider
        tabs={swipeableTabs}
        activeTab={activeTab}
        onTabChange={(id) => switchTab(id as Tab)}
      >
        {/* Mobile: Swipeable tab selector */}
        <div className="md:hidden">
          <SwipeableTabs
            tabs={swipeableTabs}
            activeTab={activeTab}
            onTabChange={(id) => switchTab(id as Tab)}
            showArch
            archGradientColor="#dbdee3"
            archGradientColorDark="#3f3f46"
          />
        </div>

        {/* Mobile: Period selector (only when Over Time is active) */}
        {activeTab === 'over-time' && (
          <div className="relative md:hidden">
            {/* Display overlay showing label and full date */}
            <div className="pointer-events-none absolute top-1/2 left-4 flex -translate-y-1/2 items-center gap-2">
              <span className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                As Of
              </span>
              <span className="text-foreground text-sm font-semibold tracking-wide uppercase">
                {selectedPeriodLabel}
              </span>
            </div>
            <select
              value={selectedPeriodId}
              onChange={(e) => handlePeriodChange(Number(e.target.value))}
              className="border-border w-full appearance-none border bg-transparent px-4 py-3 pr-10 text-sm font-semibold tracking-wide text-transparent uppercase focus:outline-none"
              disabled={isPending}
            >
              {periodsByYear.map((group) => (
                <optgroup key={group.year} label={group.year}>
                  {group.periods.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label.replace(/\s*\d{4}$/, '')}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            {isPending && (
              <div className="border-primary absolute top-1/2 right-10 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border-2 border-t-transparent" />
            )}
          </div>
        )}

        {/* Desktop: Tab bar */}
        <div className="border-border hidden gap-1 border-b md:flex">
          <button
            className={`bg-transparent px-6 py-3 text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition hover:bg-transparent ${
              activeTab === 'over-time'
                ? 'border-primary text-foreground border-b-[3px]'
                : 'text-muted-foreground hover:text-foreground border-b-[3px] border-transparent'
            }`}
            onClick={() => switchTab('over-time')}
          >
            Over Time
          </button>
          <button
            className={`bg-transparent px-6 py-3 text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition hover:bg-transparent ${
              activeTab === 'current'
                ? 'border-primary text-foreground border-b-[3px]'
                : 'text-muted-foreground border-b-[3px] border-transparent'
            } ${
              isReady('current')
                ? 'hover:text-foreground cursor-pointer'
                : 'cursor-not-allowed opacity-50'
            }`}
            onClick={() => switchTab('current')}
            disabled={!isReady('current')}
          >
            Current
          </button>
          <button
            className={`bg-transparent px-6 py-3 text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition hover:bg-transparent ${
              activeTab === 'milestones'
                ? 'border-primary text-foreground border-b-[3px]'
                : 'text-muted-foreground border-b-[3px] border-transparent'
            } ${
              isReady('milestones')
                ? 'hover:text-foreground cursor-pointer'
                : 'cursor-not-allowed opacity-50'
            }`}
            onClick={() => switchTab('milestones')}
            disabled={!isReady('milestones')}
          >
            Milestones
          </button>
        </div>

        {/* Tab content — SwipeableContent adds drag gesture on mobile, inert on desktop */}
        <SwipeableContent>
          {/* Over Time: conditionally rendered (data is always ready) */}
          {activeTab === 'over-time' && (
            <OverTimeTab
              key={`over-time-${resolvedTheme}`}
              data={overTimeData}
              isLoading={isPending}
              selectedPeriodId={selectedPeriodId}
              periodsByYear={periodsByYear}
              onPeriodChange={handlePeriodChange}
            />
          )}

          {/*
            Current & Milestones: always in DOM for streaming.
            Use display:none for inactive tabs so they have zero layout impact
            (prevents footer from being pushed down). Charts resize on tab switch
            via the resize event dispatch in switchTab.
          */}
          <div style={{ position: 'relative' }}>
            <div style={activeTab === 'current' ? fadeUpStyle : hiddenStyle}>{currentSlot}</div>
            <div style={activeTab === 'milestones' ? fadeUpStyle : hiddenStyle}>
              {milestonesSlot}
            </div>
          </div>
        </SwipeableContent>
      </SwipeableProvider>

      <style>{`
        @keyframes circlesTabFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
