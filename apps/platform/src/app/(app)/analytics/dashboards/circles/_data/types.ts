export type CircleName = 'community' | 'crowd' | 'congregation' | 'committed' | 'core';

export interface CircleStyle {
  bg: string;
  bgGradient: string;
  border: string;
  borderStyle: 'solid' | 'dashed';
  iconColor: string;
  textColor: string;
  labelColor: string;
  icon: string;
}

export interface CircleStats {
  total: string;
  newCount: string;
  change: string;
}

export interface CircleModalData {
  title: string;
  description: string;
  total: string;
  newThisMonth: string;
  change: string;
  color: string;
  gradient: string;
  headerTextColor: string;
  headerSubColor: string;
  icon: string;
  history: number[];
  movementHistory: number[];
}

export interface CircleModalDesign {
  title: string;
  description: string;
  color: string;
  gradient: string;
  headerTextColor: string;
  headerSubColor: string;
  icon: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  borderWidth?: number;
}

export interface BarChartData {
  labels: string[];
  categories: string[];
  colors: string[];
  values: number[][];
}

export type ViewMode = 'stacked' | 'percent' | 'grouped' | 'matrix';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  defaultLabel: string;
  pluralLabel: string;
  options: FilterOption[];
}

export interface MilestoneRow {
  name: string;
  totalAssigned: string;
  firstInCircle: string;
  description: string;
  mpUrl: string;
}

export interface MilestoneSection {
  circle: CircleName;
  title: string;
  tooltip: string;
  milestones: MilestoneRow[];
}

export interface FiscalPeriod {
  id: number;
  name: string;
  label: string; // formatted as "February 2025"
}

export interface OverTimeData {
  asOf: string;
  labels: string[];
  fullLabels: string[];
  overviewStats: CircleStats;
  circleStats: Record<CircleName, CircleStats>;
  inCircle: Record<CircleName, number[]>;
  movement: Record<CircleName, number[]>;
  fiscalPeriods: FiscalPeriod[];
  selectedPeriodId: number;
}

export interface LegendItem {
  label: string;
  count: string;
  percent: string;
  color: string;
  textColor?: string;
  icon?: string;
}

export interface ParticipantRow {
  Circle: string;
  Engagement_Level: string;
  Congregation_Name: string | null;
  Participant_Type: string | null;
  Household_Position: string | null;
  Marital_Status: string | null;
  Gender: string | null;
}
