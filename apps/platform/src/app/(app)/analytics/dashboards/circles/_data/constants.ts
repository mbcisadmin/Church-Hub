import type { CircleName, CircleModalDesign, CircleStyle } from './types';

export const CIRCLE_ORDER: CircleName[] = [
  'community',
  'crowd',
  'congregation',
  'committed',
  'core',
];

// Light mode circle styles
export const CIRCLE_STYLES: Record<CircleName, CircleStyle> = {
  community: {
    bg: '#c8e6c9',
    bgGradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    border: '#a5d6a7',
    borderStyle: 'dashed',
    iconColor: '#4a7c4e',
    textColor: '#252525',
    labelColor: 'text-green-700',
    icon: 'Globe',
  },
  crowd: {
    bg: '#a5d6a7',
    bgGradient: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
    border: '#81c784',
    borderStyle: 'solid',
    iconColor: '#3d6b40',
    textColor: '#252525',
    labelColor: 'text-green-800',
    icon: 'Users',
  },
  congregation: {
    bg: '#81c784',
    bgGradient: 'linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)',
    border: '#66bb6a',
    borderStyle: 'solid',
    iconColor: '#3d6b40',
    textColor: '#252525',
    labelColor: 'text-green-900',
    icon: 'Church',
  },
  committed: {
    bg: '#66bb6a',
    bgGradient: 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)',
    border: '#4caf50',
    borderStyle: 'solid',
    iconColor: '#ffffff',
    textColor: '#ffffff',
    labelColor: 'text-green-100',
    icon: 'HeartHandshake',
  },
  core: {
    bg: '#4caf50',
    bgGradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
    border: '#2e7d32',
    borderStyle: 'solid',
    iconColor: '#ffffff',
    textColor: '#ffffff',
    labelColor: 'text-green-100',
    icon: 'Star',
  },
};

export type ChartPointStyle = {
  bg: string;
  border: string;
  dashed: boolean;
  iconColor: string;
  icon: string;
};

export const CIRCLE_CHART_POINT_STYLES: ChartPointStyle[] = [
  {
    bg: 'rgba(200, 230, 201, 0.3)',
    border: '#a5d6a7',
    dashed: true,
    iconColor: '#66bb6a',
    icon: 'globe',
  },
  { bg: '#c8e6c9', border: '#a5d6a7', dashed: false, iconColor: '#4a7c4e', icon: 'users' },
  { bg: '#a5d6a7', border: '#81c784', dashed: false, iconColor: '#3d6b40', icon: 'church' },
  {
    bg: '#81c784',
    border: '#66bb6a',
    dashed: false,
    iconColor: '#ffffff',
    icon: 'heart-handshake',
  },
  { bg: '#4caf50', border: '#2e7d32', dashed: false, iconColor: '#ffffff', icon: 'star' },
];

// Dark mode chart point styles - vibrant colors on dark backgrounds
export const CIRCLE_CHART_POINT_STYLES_DARK: ChartPointStyle[] = [
  {
    bg: 'rgba(61, 90, 62, 0.5)',
    border: '#4a7a4c',
    dashed: true,
    iconColor: '#7acc7e',
    icon: 'globe',
  },
  { bg: '#3d5a3e', border: '#4a7a4c', dashed: false, iconColor: '#8ce68e', icon: 'users' },
  { bg: '#4a7a4c', border: '#5a9a5c', dashed: false, iconColor: '#a8f0aa', icon: 'church' },
  {
    bg: '#5a9a5c',
    border: '#6ab86c',
    dashed: false,
    iconColor: '#ffffff',
    icon: 'heart-handshake',
  },
  { bg: '#6ab86c', border: '#7acc7e', dashed: false, iconColor: '#ffffff', icon: 'star' },
];

export function getChartPointStyles(isDark: boolean): ChartPointStyle[] {
  return isDark ? CIRCLE_CHART_POINT_STYLES_DARK : CIRCLE_CHART_POINT_STYLES;
}

// Light mode chart colors
export const CIRCLE_LINE_COLORS = ['#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50'];
export const CIRCLE_DOUGHNUT_COLORS = ['#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50'];

// Dark mode chart colors - more vibrant and distinguishable (less muted as they get darker)
export const CIRCLE_LINE_COLORS_DARK = ['#3d5a3e', '#4a7a4c', '#5a9a5c', '#6ab86c', '#7acc7e'];
export const CIRCLE_DOUGHNUT_COLORS_DARK = ['#3d5a3e', '#4a7a4c', '#5a9a5c', '#6ab86c', '#7acc7e'];

// Dark mode circle styles - vibrant greens that are distinguishable on dark backgrounds
// Colors get progressively brighter (less muted) as they represent inner circles
export const CIRCLE_STYLES_DARK: Record<CircleName, CircleStyle> = {
  community: {
    bg: '#3d5a3e',
    bgGradient: 'linear-gradient(135deg, #2a4a2c 0%, #3d5a3e 100%)',
    border: '#4a7a4c',
    borderStyle: 'dashed',
    iconColor: '#7acc7e',
    textColor: '#e8f5e9',
    labelColor: 'text-green-300',
    icon: 'Globe',
  },
  crowd: {
    bg: '#4a7a4c',
    bgGradient: 'linear-gradient(135deg, #3d5a3e 0%, #4a7a4c 100%)',
    border: '#5a9a5c',
    borderStyle: 'solid',
    iconColor: '#8ce68e',
    textColor: '#e8f5e9',
    labelColor: 'text-green-300',
    icon: 'Users',
  },
  congregation: {
    bg: '#5a9a5c',
    bgGradient: 'linear-gradient(135deg, #4a7a4c 0%, #5a9a5c 100%)',
    border: '#6ab86c',
    borderStyle: 'solid',
    iconColor: '#a8f0aa',
    textColor: '#e8f5e9',
    labelColor: 'text-green-200',
    icon: 'Church',
  },
  committed: {
    bg: '#6ab86c',
    bgGradient: 'linear-gradient(135deg, #5a9a5c 0%, #6ab86c 100%)',
    border: '#7acc7e',
    borderStyle: 'solid',
    iconColor: '#c8faca',
    textColor: '#ffffff',
    labelColor: 'text-green-100',
    icon: 'HeartHandshake',
  },
  core: {
    bg: '#7acc7e',
    bgGradient: 'linear-gradient(135deg, #6ab86c 0%, #7acc7e 100%)',
    border: '#8ae08c',
    borderStyle: 'solid',
    iconColor: '#ffffff',
    textColor: '#ffffff',
    labelColor: 'text-green-100',
    icon: 'Star',
  },
};

// Helper to get circle styles based on theme
export function getCircleStyles(isDark: boolean): Record<CircleName, CircleStyle> {
  return isDark ? CIRCLE_STYLES_DARK : CIRCLE_STYLES;
}

export function getCircleLineColors(isDark: boolean): string[] {
  return isDark ? CIRCLE_LINE_COLORS_DARK : CIRCLE_LINE_COLORS;
}

export function getCircleDoughnutColors(isDark: boolean): string[] {
  return isDark ? CIRCLE_DOUGHNUT_COLORS_DARK : CIRCLE_DOUGHNUT_COLORS;
}

export const ENGAGEMENT_COLORS = ['#AAD43C', '#eab308', '#f97316', '#3b82f6', '#ef4444'];
export const PARTICIPANT_COLORS = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
];
export const DEMOGRAPHICS_COLORS = [
  '#f97316',
  '#fb923c',
  '#fbbf24',
  '#facc15',
  '#a3e635',
  '#4ade80',
];

// Lucide icon SVG paths for chart point markers
export const ICON_SVG_PATHS: Record<string, string> = {
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  church:
    '<path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2"/><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 22V5l-6-3-6 3v17"/><path d="M12 7v5"/><path d="M10 9h4"/>',
  'heart-handshake':
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
};

export const CIRCLE_MODAL_DESIGN: Record<'overview' | CircleName, CircleModalDesign> = {
  overview: {
    title: 'All Circles',
    description: 'Combined view across all circles of commitment',
    color: '#AAD43C',
    gradient: 'linear-gradient(135deg, #AAD43C 0%, #90c23e 100%)',
    headerTextColor: '#2d3a1a',
    headerSubColor: 'rgba(45,58,26,0.5)',
    icon: 'Target',
  },
  community: {
    title: 'Community',
    description: 'The unchurched in the immediate area - your starting point and hottest prospects',
    color: '#a5d6a7',
    gradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    headerTextColor: '#1a1a1a',
    headerSubColor: '#15803d',
    icon: 'Globe',
  },
  crowd: {
    title: 'Crowd',
    description: 'Everyone who shows up - regular service attendees',
    color: '#81c784',
    gradient: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
    headerTextColor: '#1a1a1a',
    headerSubColor: '#166534',
    icon: 'Users',
  },
  congregation: {
    title: 'Congregation',
    description: 'Official members of the church with a sense of ownership',
    color: '#66bb6a',
    gradient: 'linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)',
    headerTextColor: '#1a1a1a',
    headerSubColor: '#14532d',
    icon: 'Church',
  },
  committed: {
    title: 'Committed',
    description: 'People who pray, give, and are dedicated to growing in discipleship',
    color: '#4caf50',
    gradient: 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)',
    headerTextColor: '#ffffff',
    headerSubColor: '#dcfce7',
    icon: 'HeartHandshake',
  },
  core: {
    title: 'Core',
    description:
      'Ministers and leaders - without these people the church would come to a standstill',
    color: '#4caf50',
    gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
    headerTextColor: '#ffffff',
    headerSubColor: '#dcfce7',
    icon: 'Star',
  },
};

// Dark mode modal design - vibrant greens with better contrast
export const CIRCLE_MODAL_DESIGN_DARK: Record<'overview' | CircleName, CircleModalDesign> = {
  overview: {
    title: 'All Circles',
    description: 'Combined view across all circles of commitment',
    color: '#AAD43C',
    gradient: 'linear-gradient(135deg, #6a8a28 0%, #7aa030 100%)',
    headerTextColor: '#e8f5e9',
    headerSubColor: 'rgba(200, 230, 201, 0.7)',
    icon: 'Target',
  },
  community: {
    title: 'Community',
    description: 'The unchurched in the immediate area - your starting point and hottest prospects',
    color: '#4a7a4c',
    gradient: 'linear-gradient(135deg, #2a4a2c 0%, #3d5a3e 100%)',
    headerTextColor: '#e8f5e9',
    headerSubColor: '#a8f0aa',
    icon: 'Globe',
  },
  crowd: {
    title: 'Crowd',
    description: 'Everyone who shows up - regular service attendees',
    color: '#5a9a5c',
    gradient: 'linear-gradient(135deg, #3d5a3e 0%, #4a7a4c 100%)',
    headerTextColor: '#e8f5e9',
    headerSubColor: '#a8f0aa',
    icon: 'Users',
  },
  congregation: {
    title: 'Congregation',
    description: 'Official members of the church with a sense of ownership',
    color: '#6ab86c',
    gradient: 'linear-gradient(135deg, #4a7a4c 0%, #5a9a5c 100%)',
    headerTextColor: '#e8f5e9',
    headerSubColor: '#c8faca',
    icon: 'Church',
  },
  committed: {
    title: 'Committed',
    description: 'People who pray, give, and are dedicated to growing in discipleship',
    color: '#7acc7e',
    gradient: 'linear-gradient(135deg, #5a9a5c 0%, #6ab86c 100%)',
    headerTextColor: '#ffffff',
    headerSubColor: '#c8faca',
    icon: 'HeartHandshake',
  },
  core: {
    title: 'Core',
    description:
      'Ministers and leaders - without these people the church would come to a standstill',
    color: '#8ae08c',
    gradient: 'linear-gradient(135deg, #6ab86c 0%, #7acc7e 100%)',
    headerTextColor: '#ffffff',
    headerSubColor: '#e8faea',
    icon: 'Star',
  },
};

export function getCircleModalDesign(
  isDark: boolean
): Record<'overview' | CircleName, CircleModalDesign> {
  return isDark ? CIRCLE_MODAL_DESIGN_DARK : CIRCLE_MODAL_DESIGN;
}
