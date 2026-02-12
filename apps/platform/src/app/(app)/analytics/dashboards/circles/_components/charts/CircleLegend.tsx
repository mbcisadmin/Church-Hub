'use client';

import { Globe, Users, Church, HeartHandshake, Star } from 'lucide-react';
import { getChartPointStyles } from '../../_data/constants';

const LEGEND_ITEMS = [
  { label: 'Community', Icon: Globe },
  { label: 'Crowd', Icon: Users },
  { label: 'Congregation', Icon: Church },
  { label: 'Committed', Icon: HeartHandshake },
  { label: 'Core', Icon: Star },
];

interface CircleLegendProps {
  isDark?: boolean;
}

export default function CircleLegend({ isDark = false }: CircleLegendProps) {
  const pointStyles = getChartPointStyles(isDark);

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2 md:gap-4">
      {LEGEND_ITEMS.map((item, i) => {
        const style = pointStyles[i];
        return (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full"
              style={{
                backgroundColor: style.bg,
                border: `1.5px ${style.dashed ? 'dashed' : 'solid'} ${style.border}`,
              }}
            >
              <item.Icon className="h-2.5 w-2.5" style={{ color: style.iconColor }} />
            </div>
            <span className="text-muted-foreground text-xs font-semibold">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
