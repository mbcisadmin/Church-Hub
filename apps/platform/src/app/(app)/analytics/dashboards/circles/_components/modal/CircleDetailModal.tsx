'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Users, Church, HeartHandshake, Star, Target } from 'lucide-react';
import { ResponsiveSheet, SheetPage } from '@church/nextjs-ui/components/ResponsiveSheet';
import { SegmentedControl } from '@church/nextjs-ui/components/SegmentedControl';
import ModalLineChart from '../charts/ModalLineChart';
import type { CircleName, CircleModalData } from '../../_data/types';
import { getCircleModalDesign } from '../../_data/constants';

const ICON_MAP: Record<string, typeof Globe> = {
  Globe,
  Users,
  Church,
  HeartHandshake,
  Star,
  Target,
};

interface CircleDetailModalProps {
  open: boolean;
  onClose: () => void;
  circle: CircleName | 'overview' | null;
  modalData: Record<'overview' | CircleName, CircleModalData>;
  labels: (string | string[])[];
}

type ChartMode = 'inCircle' | 'joinedCircle';

// Header component for the themed top section (used as draggable area on mobile)
function ModalHeader({ data }: { data: CircleModalData }) {
  const Icon = ICON_MAP[data.icon] ?? Target;

  return (
    <div
      className="relative overflow-hidden px-4 pt-3 pb-4 md:px-8 md:pt-6 md:pb-6"
      style={{ background: data.gradient }}
    >
      {/* Drag handle indicator for mobile (styled to match gradient) */}
      <div className="mb-3 flex justify-center md:hidden">
        <div
          className="h-1.5 w-14 rounded-full"
          style={{ backgroundColor: `${data.headerTextColor}40` }}
        />
      </div>
      <div className="pointer-events-none absolute top-12 right-2 md:top-1/2 md:-right-4 md:-translate-y-1/2">
        <Icon
          className="h-28 w-28 opacity-10 md:h-40 md:w-40"
          style={{ color: data.headerTextColor }}
        />
      </div>
      <div className="relative z-10">
        <p
          className="mb-2 text-xs font-bold tracking-wider uppercase"
          style={{ color: data.headerSubColor }}
        >
          Circle Overview
        </p>
        <h2
          className="text-2xl font-bold tracking-tight uppercase md:text-3xl"
          style={{ color: data.headerTextColor }}
        >
          {data.title}
        </h2>
        <p className="mt-1 text-sm md:text-base" style={{ color: data.headerSubColor }}>
          {data.description}
        </p>

        {/* Stats row */}
        <div className="mt-4 flex gap-6">
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-xl font-extrabold md:text-2xl"
              style={{ color: data.headerTextColor }}
            >
              {data.total.toLocaleString()}
            </span>
            <span
              className="text-[10px] tracking-wide uppercase md:text-xs"
              style={{ color: data.headerSubColor }}
            >
              Total
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-xl font-extrabold md:text-2xl"
              style={{ color: data.headerTextColor }}
            >
              +{data.newThisMonth}
            </span>
            <span
              className="text-[10px] tracking-wide uppercase md:text-xs"
              style={{ color: data.headerSubColor }}
            >
              New
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Content component for the scrollable body area
function ModalBody({
  data,
  labels,
  chartMode,
  onChartModeChange,
}: {
  data: CircleModalData;
  labels: (string | string[])[];
  chartMode: ChartMode;
  onChartModeChange: (mode: ChartMode) => void;
}) {
  const chartOptions = [
    { value: 'inCircle' as ChartMode, label: 'In Circle' },
    { value: 'joinedCircle' as ChartMode, label: 'Joined Circle' },
  ];

  return (
    <div className="bg-card p-4 md:p-8">
      {/* Chart toggle */}
      <SegmentedControl
        options={chartOptions}
        value={chartMode}
        onChange={onChartModeChange}
        variant="secondary"
        className="w-full"
      />

      {/* Chart */}
      <div className="mt-4 md:mt-6">
        <ModalLineChart
          history={chartMode === 'inCircle' ? data.history : data.movementHistory}
          color={data.color}
          label={data.title}
          labels={labels}
        />
      </div>
    </div>
  );
}

export default function CircleDetailModal({
  open,
  onClose,
  circle,
  modalData,
  labels,
}: CircleDetailModalProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('inCircle');

  // Keep track of last valid data for exit animation
  const lastDataRef = useRef<CircleModalData | null>(null);
  const lastLabelsRef = useRef<(string | string[])[]>(labels);

  // Update refs when we have valid data
  if (circle && modalData[circle]) {
    lastDataRef.current = modalData[circle];
    lastLabelsRef.current = labels;
  }

  // Reset chart mode when modal opens with a new circle
  useEffect(() => {
    if (open) {
      setChartMode('inCircle');
    }
  }, [open, circle]);

  // Use last valid data for rendering (allows exit animation)
  const data = lastDataRef.current;

  return (
    <ResponsiveSheet
      open={open && !!circle}
      onClose={onClose}
      panelClassName="bg-card overflow-hidden"
      maxWidth="max-w-4xl"
      noPanelPadding
      sheetMaxHeight="90dvh"
      header={data ? <ModalHeader data={data} /> : undefined}
    >
      <SheetPage name="main">
        {data && (
          <ModalBody
            data={data}
            labels={lastLabelsRef.current}
            chartMode={chartMode}
            onChartModeChange={setChartMode}
          />
        )}
      </SheetPage>
    </ResponsiveSheet>
  );
}
