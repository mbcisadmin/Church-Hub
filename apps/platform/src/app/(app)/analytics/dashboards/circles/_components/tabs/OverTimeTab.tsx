'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { BottomSheet } from '@church/nextjs-ui/bottom-sheet';
import { SegmentedControl } from '@church/nextjs-ui/components/SegmentedControl';
import ConcentricCircles from '../visualizations/ConcentricCircles';
import CircleStatsPanel from '../visualizations/CircleStatsPanel';
import InCircleLineChart from '../charts/InCircleLineChart';
import MovementLineChart from '../charts/MovementLineChart';
import CircleDetailModal from '../modal/CircleDetailModal';
import type { CircleName, CircleModalData, OverTimeData } from '../../_data/types';
import { CIRCLE_ORDER, getCircleModalDesign } from '../../_data/constants';

interface PeriodGroup {
  year: string;
  periods: { id: number; label: string }[];
}

interface OverTimeTabProps {
  data: OverTimeData;
  isLoading?: boolean;
  selectedPeriodId?: number;
  periodsByYear?: PeriodGroup[];
  onPeriodChange?: (periodId: number) => void;
}

// Skeleton component for stat values
function StatSkeleton({ width = 'w-16' }: { width?: string }) {
  return <div className={`bg-muted h-7 ${width} animate-pulse rounded`} />;
}

// Skeleton for charts
function ChartSkeleton() {
  return (
    <div className="flex min-h-[360px] flex-col md:min-h-[520px]">
      <div className="mb-4 md:mb-6">
        <div className="bg-muted h-5 w-32 animate-pulse rounded" />
        <div className="bg-muted mt-1 h-3 w-40 animate-pulse rounded" />
      </div>
      <div className="bg-muted min-h-0 flex-1 animate-pulse rounded" />
      <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-muted h-4 w-16 animate-pulse rounded md:w-20" />
        ))}
      </div>
    </div>
  );
}

export default function OverTimeTab({
  data,
  isLoading,
  selectedPeriodId,
  periodsByYear,
  onPeriodChange,
}: OverTimeTabProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [openCircle, setOpenCircle] = useState<CircleName | 'overview' | null>(null);
  const [mobileChart, setMobileChart] = useState<'inCircle' | 'movement'>('inCircle');
  const [overviewSheetOpen, setOverviewSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Build chart labels with year shown at year boundaries
  const chartData = useMemo(() => {
    const labels: (string | string[])[] = data.labels.map((month, i) => {
      const year = data.fullLabels[i].split(' ').pop() ?? '';
      if (i === 0) return [month, year];
      const prevYear = data.fullLabels[i - 1]?.split(' ').pop() ?? '';
      if (year !== prevYear) return [month, year];
      return month;
    });

    // Subtitle: "Feb 2025 – Jan 2026"
    const startLabel = data.fullLabels[0]?.replace(/^(\w{3})\w*/, '$1') ?? '';
    const endLabel =
      data.fullLabels[data.fullLabels.length - 1]?.replace(/^(\w{3})\w*/, '$1') ?? '';
    const subtitle = startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;

    return { labels, subtitle };
  }, [data.labels, data.fullLabels]);

  const modalData = useMemo(() => {
    const circleModalDesign = getCircleModalDesign(isDark);
    const result = {} as Record<'overview' | CircleName, CircleModalData>;

    // Overview: sum all circles' inCircle and movement data for history
    const overviewHistory = chartData.labels.map((_, i) =>
      CIRCLE_ORDER.reduce((sum, c) => sum + data.inCircle[c][i], 0)
    );
    const overviewMovement = chartData.labels.map((_, i) =>
      CIRCLE_ORDER.reduce((sum, c) => sum + data.movement[c][i], 0)
    );
    result.overview = {
      ...circleModalDesign.overview,
      total: data.overviewStats.total,
      newThisMonth: data.overviewStats.newCount,
      change: data.overviewStats.change,
      history: overviewHistory,
      movementHistory: overviewMovement,
    };

    // Per-circle entries
    for (const circle of CIRCLE_ORDER) {
      const stats = data.circleStats[circle];
      result[circle] = {
        ...circleModalDesign[circle],
        total: stats.total,
        newThisMonth: stats.newCount,
        change: stats.change,
        history: data.inCircle[circle],
        movementHistory: data.movement[circle],
      };
    }

    return result;
  }, [data, chartData.labels, isDark]);

  function handleCircleClick(circle: CircleName | 'overview') {
    if (isLoading) return;
    setOpenCircle(circle);
  }

  return (
    <div>
      {/* Circle Overview - Mobile (clickable to open chart bottom sheet) */}
      <button
        className="bg-secondary mt-6 w-full border-2 border-transparent px-3 py-4 text-left md:mt-0 md:hidden"
        onClick={() => setOverviewSheetOpen(true)}
      >
        <div className="flex items-center">
          <div className="flex-1">
            <div className="text-sm font-bold tracking-wide text-white uppercase">
              Circle Overview
            </div>
            <div className="text-[10px] tracking-wide text-gray-500 uppercase">{data.asOf}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              {isLoading ? (
                <StatSkeleton width="w-12" />
              ) : (
                <div className="text-sm font-bold text-white">{data.overviewStats.total}</div>
              )}
              <div className="text-[10px] tracking-wide text-gray-500 uppercase">Total</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </button>

      {/* Overview Chart Bottom Sheet - Mobile (portaled to body to escape SwipeableContent transforms) */}
      {mounted &&
        createPortal(
          <BottomSheet
            open={overviewSheetOpen}
            onClose={() => setOverviewSheetOpen(false)}
            className="bg-secondary"
            maxHeight="90dvh"
            hideHandle
            header={
              <div className="px-4 pt-3 pb-4">
                {/* Custom drag handle */}
                <div className="mb-4 flex justify-center">
                  <div className="h-1.5 w-14 rounded-full bg-white/40" />
                </div>
                <div className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Circle Overview
                </div>
                <div className="text-2xl font-bold tracking-tight text-white uppercase">
                  All Circles
                </div>
                <div className="mt-1 text-xs tracking-wide text-gray-500 uppercase">
                  {data.asOf}
                </div>
              </div>
            }
          >
            <div className="p-4">
              {/* Chart toggle */}
              <SegmentedControl
                options={[
                  { value: 'inCircle', label: 'In Circle' },
                  { value: 'movement', label: 'Joined Circle' },
                ]}
                value={mobileChart}
                onChange={setMobileChart}
                variant="primary"
                className="w-full"
              />

              {/* Chart */}
              <div className="mt-4">
                {isLoading ? (
                  <ChartSkeleton />
                ) : mobileChart === 'inCircle' ? (
                  <InCircleLineChart
                    labels={chartData.labels}
                    data={data.inCircle}
                    subtitle={chartData.subtitle}
                  />
                ) : (
                  <MovementLineChart
                    labels={chartData.labels}
                    data={data.movement}
                    subtitle={chartData.subtitle}
                  />
                )}
              </div>
            </div>
          </BottomSheet>,
          document.body
        )}

      {/* Mobile stats panel - full width, no card, gap-2 to match other bars */}
      <div className="mt-2 flex flex-col gap-2 pb-6 md:hidden">
        <CircleStatsPanel
          circleStats={data.circleStats}
          onCircleClick={handleCircleClick}
          isLoading={isLoading}
        />
      </div>

      {/* Circle Overview - Desktop */}
      <div className="hidden md:block">
        {/* Desktop header */}
        <div className="bg-secondary flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold tracking-wider text-white uppercase">
              Circle Overview
            </h2>
            {periodsByYear && onPeriodChange && selectedPeriodId !== undefined ? (
              <div className="relative mt-1 inline-flex items-center gap-1">
                <span className="pointer-events-none text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  {data.asOf}
                </span>
                {isLoading ? (
                  <div className="border-primary ml-1 h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent" />
                ) : (
                  <ChevronDown className="pointer-events-none h-3.5 w-3.5 text-gray-500" />
                )}
                <select
                  value={selectedPeriodId}
                  onChange={(e) => onPeriodChange(Number(e.target.value))}
                  className="absolute inset-0 cursor-pointer border-none bg-transparent text-sm font-semibold tracking-wide text-transparent uppercase focus:outline-none"
                  disabled={isLoading}
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
              </div>
            ) : (
              <p className="mt-1 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                {data.asOf}
              </p>
            )}
          </div>
          <div className="text-right">
            {isLoading ? (
              <StatSkeleton width="w-20" />
            ) : (
              <div className="text-2xl font-bold text-white">{data.overviewStats.total}</div>
            )}
            <div className="text-xs tracking-wide text-gray-500 uppercase">Total</div>
          </div>
        </div>

        <div className="px-8 py-10 lg:px-14 lg:py-14">
          <div className="flex items-stretch gap-16 xl:gap-28">
            <div className="flex w-[400px] flex-shrink-0 items-center justify-center lg:w-[440px]">
              <ConcentricCircles onCircleClick={handleCircleClick} />
            </div>
            <CircleStatsPanel
              circleStats={data.circleStats}
              onCircleClick={handleCircleClick}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Desktop: Both charts side by side */}
      <div className="mt-6 hidden gap-20 md:grid md:grid-cols-2 xl:gap-28">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <InCircleLineChart
              labels={chartData.labels}
              data={data.inCircle}
              subtitle={chartData.subtitle}
            />
            <MovementLineChart
              labels={chartData.labels}
              data={data.movement}
              subtitle={chartData.subtitle}
            />
          </>
        )}
      </div>

      {/* Circle detail modal (portaled to body to escape SwipeableContent transforms) */}
      {mounted &&
        createPortal(
          <CircleDetailModal
            open={!!openCircle}
            onClose={() => setOpenCircle(null)}
            circle={openCircle}
            modalData={modalData}
            labels={chartData.labels}
          />,
          document.body
        )}
    </div>
  );
}
