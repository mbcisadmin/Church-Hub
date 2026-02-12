'use client';

import { useMemo, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './chart-setup';
import { createCircleIconSVG } from './chart-utils';
import { useIsMobile } from './useIsMobile';
import { getChartPointStyles, getCircleLineColors } from '../../_data/constants';
import type { CircleName } from '../../_data/types';
import CircleLegend from './CircleLegend';

interface InCircleLineChartProps {
  labels: (string | string[])[];
  data: Record<CircleName, number[]>;
  subtitle?: string;
}

export default function InCircleLineChart({
  labels,
  data: circleData,
  subtitle,
}: InCircleLineChartProps) {
  const isMobile = useIsMobile();

  // Track dark mode for chart colors
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const pointStyles = getChartPointStyles(isDark);
  const lineColors = getCircleLineColors(isDark);

  const pointImages = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return pointStyles.map((s) =>
      createCircleIconSVG(s.bg, s.border, s.iconColor, s.icon, s.dashed)
    );
  }, [pointStyles]);

  const circleNames = ['Community', 'Crowd', 'Congregation', 'Committed', 'Core'] as const;
  const dataKeys = ['community', 'crowd', 'congregation', 'committed', 'core'] as const;

  const data = {
    labels,
    datasets: dataKeys.map((key, i) => ({
      label: circleNames[i],
      data: circleData[key],
      borderColor: lineColors[i],
      backgroundColor: lineColors[i],
      borderWidth: key === 'core' ? 3 : 2,
      tension: 0.4,
      fill: false,
      pointStyle: pointImages[i] as unknown as string,
      pointRadius: 8,
      pointHoverRadius: 10,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: !isMobile },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(128, 128, 128, 0.12)' },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, autoSkip: false, maxRotation: 0 },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="text-card-foreground flex min-h-[360px] flex-col md:min-h-[520px]">
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <div>
          <h2 className="text-base font-bold tracking-tight uppercase md:text-lg">In a Circle</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5 text-xs tracking-wide">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <Line data={data} options={options} />
      </div>
      <CircleLegend isDark={isDark} />
    </div>
  );
}
