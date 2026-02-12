'use client';

import { Globe, Users, Church, HeartHandshake, Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { CircleName } from '../../_data/types';

// Circle layout configuration (size/position)
const CIRCLE_LAYOUT: {
  name: CircleName;
  label: string;
  size: number;
  offset: number;
  Icon: typeof Globe;
  iconSize: number;
}[] = [
  { name: 'community', label: 'Community', size: 440, offset: 0, Icon: Globe, iconSize: 20 },
  { name: 'crowd', label: 'Crowd', size: 352, offset: 44, Icon: Users, iconSize: 20 },
  {
    name: 'congregation',
    label: 'Congregation',
    size: 264,
    offset: 88,
    Icon: Church,
    iconSize: 20,
  },
  {
    name: 'committed',
    label: 'Committed',
    size: 176,
    offset: 132,
    Icon: HeartHandshake,
    iconSize: 20,
  },
  { name: 'core', label: 'Core', size: 88, offset: 176, Icon: Star, iconSize: 16 },
];

// Light mode colors
const LIGHT_COLORS: Record<
  CircleName,
  { bg: string; border: string; borderStyle: string; iconColor: string }
> = {
  community: {
    bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    border: '#a5d6a7',
    borderStyle: 'dashed',
    iconColor: '#4a7c4e',
  },
  crowd: {
    bg: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
    border: '#81c784',
    borderStyle: 'solid',
    iconColor: '#3d6b40',
  },
  congregation: {
    bg: 'linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)',
    border: '#66bb6a',
    borderStyle: 'solid',
    iconColor: '#2d5a30',
  },
  committed: {
    bg: 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)',
    border: '#4caf50',
    borderStyle: 'solid',
    iconColor: '#fff',
  },
  core: {
    bg: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
    border: '#2e7d32',
    borderStyle: 'solid',
    iconColor: '#fff',
  },
};

// Dark mode colors - vibrant greens, progressively brighter for inner circles
const DARK_COLORS: Record<
  CircleName,
  { bg: string; border: string; borderStyle: string; iconColor: string }
> = {
  community: {
    bg: 'linear-gradient(135deg, #2a4a2c 0%, #3d5a3e 100%)',
    border: '#4a7a4c',
    borderStyle: 'dashed',
    iconColor: '#7acc7e',
  },
  crowd: {
    bg: 'linear-gradient(135deg, #3d5a3e 0%, #4a7a4c 100%)',
    border: '#5a9a5c',
    borderStyle: 'solid',
    iconColor: '#8ce68e',
  },
  congregation: {
    bg: 'linear-gradient(135deg, #4a7a4c 0%, #5a9a5c 100%)',
    border: '#6ab86c',
    borderStyle: 'solid',
    iconColor: '#a8f0aa',
  },
  committed: {
    bg: 'linear-gradient(135deg, #5a9a5c 0%, #6ab86c 100%)',
    border: '#7acc7e',
    borderStyle: 'solid',
    iconColor: '#c8faca',
  },
  core: {
    bg: 'linear-gradient(135deg, #6ab86c 0%, #7acc7e 100%)',
    border: '#8ae08c',
    borderStyle: 'solid',
    iconColor: '#fff',
  },
};

interface ConcentricCirclesProps {
  onCircleClick: (circle: CircleName | 'overview') => void;
}

export default function ConcentricCircles({ onCircleClick }: ConcentricCirclesProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Base size is 440px, all circles scale proportionally
  const BASE_SIZE = 440;

  return (
    <div className="relative aspect-square w-full max-w-[440px]">
      {CIRCLE_LAYOUT.map((c) => {
        const isCore = c.name === 'core';
        const colorStyle = colors[c.name];
        // Convert pixel values to percentages
        const sizePercent = (c.size / BASE_SIZE) * 100;
        const offsetPercent = (c.offset / BASE_SIZE) * 100;

        return (
          <div
            key={c.name}
            className="absolute flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-[1.02]"
            style={{
              width: `${sizePercent}%`,
              height: `${sizePercent}%`,
              top: `${offsetPercent}%`,
              left: `${offsetPercent}%`,
              background: colorStyle.bg,
              border: `3px ${colorStyle.borderStyle} ${colorStyle.border}`,
              boxShadow: 'none',
            }}
            onClick={() => onCircleClick(c.name)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 0 30px rgba(170, 212, 60, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <span
              className="absolute whitespace-nowrap"
              style={
                isCore
                  ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
                  : { top: 2, left: '50%', transform: 'translateX(-50%)' }
              }
            >
              <c.Icon
                style={{ width: c.iconSize, height: c.iconSize, color: colorStyle.iconColor }}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}
