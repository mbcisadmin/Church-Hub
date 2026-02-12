'use client';

import { Globe, Users, Church, HeartHandshake, Star } from 'lucide-react';
import type { CircleName } from '../../_data/types';
import { CIRCLE_CHART_POINT_STYLES } from '../../_data/constants';

const ICON_MAP = { Globe, Users, Church, HeartHandshake, Star };
const ICON_NAMES: Record<CircleName, keyof typeof ICON_MAP> = {
  community: 'Globe',
  crowd: 'Users',
  congregation: 'Church',
  committed: 'HeartHandshake',
  core: 'Star',
};

interface CircleIconProps {
  circle: CircleName;
  size?: number;
  className?: string;
}

export default function CircleIcon({ circle, size = 24, className }: CircleIconProps) {
  const index = ['community', 'crowd', 'congregation', 'committed', 'core'].indexOf(circle);
  const style = CIRCLE_CHART_POINT_STYLES[index];
  const Icon = ICON_MAP[ICON_NAMES[circle]];
  const iconSize = size * 0.5;

  return (
    <div
      className={`flex items-center justify-center rounded-full ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        backgroundColor: style.bg,
        border: `2px ${style.dashed ? 'dashed' : 'solid'} ${style.border}`,
      }}
    >
      <Icon style={{ width: iconSize, height: iconSize, color: style.iconColor }} />
    </div>
  );
}
