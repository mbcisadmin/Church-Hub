'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Search,
  Plus,
  Pin,
  Zap,
  LayoutDashboard,
  Rocket,
  FileSpreadsheet,
  Target,
  Camera,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquarePlus,
  ArrowRight,
  X,
  Users,
  DollarSign,
  Church,
  Heart,
  Handshake,
  UsersRound,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { BaseCard } from '@church/nextjs-ui/components/BaseCard';
import { Sparkline } from '@church/nextjs-ui/components/Sparkline';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { getPinnedDashboardsForLevel } from '@/lib/mockData';
import type { PinnedDashboard } from '@/lib/mockData';

// ============================================================================
// Dashboard card sparkline data (mock - would come from API)
// ============================================================================

const DASHBOARD_SPARKLINES: Record<
  string,
  {
    data: number[];
    color: string;
    variant: 'line' | 'bar' | 'dots';
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  circles: {
    data: [18.2, 19.1, 19.8, 20.5, 21.2, 22.0, 22.8, 23.5, 24.3],
    color: '#22c55e',
    variant: 'line',
    trend: 'up',
    trendValue: '+8.2%',
    icon: UsersRound,
  },
  giving: {
    data: [145, 168, 152, 178, 165, 190, 172, 185, 182],
    color: '#3b82f6',
    variant: 'bar',
    trend: 'up',
    trendValue: '+4.1%',
    icon: DollarSign,
  },
  attendance: {
    data: [1180, 1220, 1195, 1260, 1230, 1245, 1210, 1255, 1247],
    color: '#a855f7',
    variant: 'line',
    trend: 'up',
    trendValue: '+2.3%',
    icon: Church,
  },
  volunteers: {
    data: [310, 318, 325, 330, 328, 335, 340, 338, 342],
    color: '#f59e0b',
    variant: 'dots',
    trend: 'up',
    trendValue: '+12',
    icon: Handshake,
  },
  groups: {
    data: [72, 75, 78, 80, 82, 84, 86, 88, 89],
    color: '#ec4899',
    variant: 'line',
    trend: 'up',
    trendValue: '+5',
    icon: UsersRound,
  },
};

// Extended detail for the expand modal
const DASHBOARD_DETAILS: Record<string, { description: string; highlights: string[] }> = {
  circles: {
    description: 'Engagement journey tracking across all circle stages',
    highlights: [
      '24.3k total people tracked',
      '3.2k moved circles this quarter',
      '82% retention rate',
    ],
  },
  giving: {
    description: 'Financial contribution trends and donor analytics',
    highlights: ['$182k month-to-date', '234 recurring donors', '+15% vs last year'],
  },
  attendance: {
    description: 'Weekend service attendance patterns and growth',
    highlights: ['1,247 average this month', '23 first-time guests', '4 services per weekend'],
  },
  volunteers: {
    description: 'Active volunteer tracking and scheduling insights',
    highlights: ['342 active volunteers', '89% fill rate', '12 new this month'],
  },
  groups: {
    description: 'Small group participation and health metrics',
    highlights: ['89 active groups', '1,856 participants', '13 avg group size'],
  },
};

// ============================================================================
// Quick Facts with sparklines
// ============================================================================

const QUICK_FACTS = [
  {
    id: 'attendance',
    title: 'Weekend Avg',
    stat: '1,247',
    statLabel: 'this month',
    category: 'Attendance',
    trend: 'up' as const,
    trendValue: '+12%',
    sparkData: [1050, 1120, 1180, 1220, 1195, 1260, 1230, 1247],
    sparkColor: '#a855f7',
    icon: Users,
  },
  {
    id: 'giving',
    title: 'Giving MTD',
    stat: '$182k',
    statLabel: 'total',
    category: 'Finance',
    trend: 'up' as const,
    trendValue: '+4%',
    sparkData: [145, 152, 160, 168, 155, 172, 178, 182],
    sparkColor: '#3b82f6',
    icon: DollarSign,
  },
  {
    id: 'groups',
    title: 'Active Groups',
    stat: '142',
    statLabel: 'groups',
    category: 'Community',
    trend: 'up' as const,
    trendValue: '+3',
    sparkData: [128, 130, 132, 135, 136, 138, 140, 142],
    sparkColor: '#ec4899',
    icon: UsersRound,
  },
  {
    id: 'volunteers',
    title: 'Serving',
    stat: '342',
    statLabel: 'active',
    category: 'Serving',
    trend: 'up' as const,
    trendValue: '+12',
    sparkData: [298, 305, 310, 318, 325, 330, 338, 342],
    sparkColor: '#f59e0b',
    icon: Heart,
  },
  {
    id: 'first-time',
    title: 'First Timers',
    stat: '23',
    statLabel: 'this week',
    category: 'Weekend',
    trend: 'down' as const,
    trendValue: '-2',
    sparkData: [28, 25, 30, 22, 18, 26, 20, 23],
    sparkColor: '#22c55e',
    icon: TrendingUp,
  },
];

// ============================================================================
// Analytics apps
// ============================================================================

const ANALYTICS_APPS = [
  {
    id: 'dashboards',
    name: 'Dashboards',
    description: 'In-depth data visualizations',
    icon: LayoutDashboard,
    route: '/analytics/dashboards',
  },
  {
    id: 'quick-facts',
    name: 'Quick Facts',
    description: 'Key stats at a glance',
    icon: Zap,
    route: '/analytics/quick-facts',
  },
  {
    id: 'exports',
    name: 'Exports',
    description: 'Download reports and data',
    icon: FileSpreadsheet,
    route: '/analytics/exports',
  },
  {
    id: 'goals',
    name: 'Goals',
    description: 'Track ministry objectives',
    icon: Target,
    route: '/analytics/goals',
  },
  {
    id: 'snapshots',
    name: 'Snapshots',
    description: 'Point-in-time data captures',
    icon: Camera,
    route: '/analytics/snapshots',
  },
  {
    id: 'trends',
    name: 'Trends',
    description: 'Long-term patterns and insights',
    icon: TrendingUp,
    route: '/analytics/trends',
  },
  {
    id: 'request',
    name: 'Request',
    description: 'Request a custom dashboard',
    icon: MessageSquarePlus,
    route: '/analytics/request',
  },
];

// ============================================================================
// Dashboard Card with Sparkline
// ============================================================================

function DashboardSparkCard({
  dashboard,
  onClick,
  onExpand,
}: {
  dashboard: PinnedDashboard;
  onClick: () => void;
  onExpand: () => void;
}) {
  const spark = DASHBOARD_SPARKLINES[dashboard.id];
  const SparkIcon = spark?.icon || BarChart3;
  const TrendIcon =
    spark?.trend === 'up' ? TrendingUp : spark?.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    spark?.trend === 'up'
      ? 'text-green-500'
      : spark?.trend === 'down'
        ? 'text-red-500'
        : 'text-muted-foreground';

  return (
    <BaseCard
      layoutId={`dashboard-card-${dashboard.id}`}
      onClick={onExpand}
      whileHover={{ scale: 1.03, y: -2 }}
      className="overflow-hidden"
    >
      {/* Watermark icon */}
      <SparkIcon className="text-watermark absolute right-1 bottom-1 h-12 w-12" />

      {/* Stat */}
      <div className="relative z-10 w-full text-center">
        {dashboard.category && (
          <p className="text-muted-foreground/70 text-[9px] font-semibold tracking-wider uppercase">
            {dashboard.category}
          </p>
        )}
        <p className="text-foreground text-lg leading-tight font-bold">{dashboard.stat}</p>
        {dashboard.statLabel && (
          <p className="text-muted-foreground text-[8px] font-semibold tracking-wide uppercase">
            {dashboard.statLabel}
          </p>
        )}
      </div>

      {/* Sparkline */}
      {spark && (
        <div className="relative z-10 mx-auto mt-1">
          <Sparkline
            data={spark.data}
            color={spark.color}
            variant={spark.variant}
            width={100}
            height={28}
            filled={spark.variant === 'line'}
            fillOpacity={0.1}
          />
        </div>
      )}

      {/* Title + Trend */}
      <div className="relative z-10 mt-auto w-full text-center">
        <p className="text-foreground text-xs leading-tight font-bold tracking-wide uppercase">
          {dashboard.label}
        </p>
        {spark && (
          <div className={`flex items-center justify-center gap-0.5 ${trendColor}`}>
            <TrendIcon className="h-2.5 w-2.5" />
            <span className="text-[9px] font-medium">{spark.trendValue}</span>
          </div>
        )}
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Dashboard Expand Modal
// ============================================================================

function DashboardExpandModal({
  dashboard,
  onClose,
  onNavigate,
}: {
  dashboard: PinnedDashboard;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const spark = DASHBOARD_SPARKLINES[dashboard.id];
  const details = DASHBOARD_DETAILS[dashboard.id];
  const SparkIcon = spark?.icon || BarChart3;
  const TrendIcon =
    spark?.trend === 'up' ? TrendingUp : spark?.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    spark?.trend === 'up'
      ? 'text-green-500'
      : spark?.trend === 'down'
        ? 'text-red-500'
        : 'text-muted-foreground';

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          layoutId={`dashboard-card-${dashboard.id}`}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border-border relative w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-white/80 transition-colors hover:bg-black/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header area with gradient */}
          <div
            className="relative px-6 pt-6 pb-4"
            style={{
              background: spark
                ? `linear-gradient(135deg, ${spark.color}15 0%, ${spark.color}05 100%)`
                : undefined,
            }}
          >
            {/* Watermark */}
            <SparkIcon className="text-watermark absolute top-2 right-12 h-20 w-20" />

            <div className="relative z-10">
              {dashboard.category && (
                <p className="text-muted-foreground mb-1 text-[10px] font-semibold tracking-wider uppercase">
                  {dashboard.category}
                </p>
              )}
              <div className="flex items-baseline gap-3">
                <p className="text-foreground text-4xl font-bold">{dashboard.stat}</p>
                {dashboard.statLabel && (
                  <p className="text-muted-foreground text-sm font-medium">{dashboard.statLabel}</p>
                )}
              </div>
              <p className="text-foreground mt-1 text-lg font-bold tracking-wide uppercase">
                {dashboard.label}
              </p>
              {spark && (
                <div className={`mt-1 flex items-center gap-1 ${trendColor}`}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  <span className="text-sm font-semibold">{spark.trendValue}</span>
                  <span className="text-muted-foreground ml-1 text-xs">vs last period</span>
                </div>
              )}
            </div>
          </div>

          {/* Sparkline - larger in modal */}
          {spark && (
            <div className="px-6 py-3">
              <Sparkline
                data={spark.data}
                color={spark.color}
                variant={spark.variant === 'dots' ? 'line' : spark.variant}
                width={320}
                height={64}
                filled
                fillOpacity={0.08}
                strokeWidth={2}
              />
            </div>
          )}

          {/* Details */}
          {details && (
            <div className="px-6 pb-4">
              <p className="text-muted-foreground mb-3 text-sm">{details.description}</p>
              <ul className="space-y-1.5">
                {details.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: spark?.color || '#888' }}
                    />
                    <span className="text-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action */}
          <div className="border-border border-t px-6 py-4">
            <button
              onClick={onNavigate}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              View Full Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ============================================================================
// Quick Fact Card with Sparkline
// ============================================================================

function QuickFactSparkCard({
  fact,
  onClick,
}: {
  fact: (typeof QUICK_FACTS)[number];
  onClick: () => void;
}) {
  const TrendIcon = fact.trend === 'up' ? TrendingUp : fact.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    fact.trend === 'up'
      ? 'text-green-500'
      : fact.trend === 'down'
        ? 'text-red-500'
        : 'text-muted-foreground';
  const FactIcon = fact.icon;

  return (
    <BaseCard onClick={onClick} whileHover={{ scale: 1.03, y: -2 }} className="overflow-hidden">
      {/* Watermark */}
      <FactIcon className="text-watermark absolute right-1 bottom-1 h-12 w-12" />

      {/* Stat */}
      <div className="relative z-10 text-center">
        <p className="text-foreground text-2xl leading-none font-bold">{fact.stat}</p>
        <p className="text-muted-foreground mt-0.5 text-[8px] font-semibold tracking-wide uppercase">
          {fact.statLabel}
        </p>
      </div>

      {/* Sparkline */}
      <div className="relative z-10 mx-auto mt-1">
        <Sparkline
          data={fact.sparkData}
          color={fact.sparkColor}
          variant="line"
          width={90}
          height={24}
          filled
          fillOpacity={0.1}
        />
      </div>

      {/* Title + Trend */}
      <div className="relative z-10 mt-auto text-center">
        <p className="text-foreground text-[10px] font-bold tracking-wide uppercase">
          {fact.title}
        </p>
        <div className={`flex items-center justify-center gap-0.5 ${trendColor}`}>
          <TrendIcon className="h-2.5 w-2.5" />
          <span className="text-[9px] font-medium">{fact.trendValue}</span>
        </div>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function AnalyticsCategoryPage() {
  const router = useRouter();
  const { accessLevel } = useTestingContext();
  const { buildUrl } = usePreserveParams();
  const [expandedDashboard, setExpandedDashboard] = useState<PinnedDashboard | null>(null);

  useEffect(() => {
    document.title = 'Analytics | The Hub';
  }, []);

  const pinnedDashboards = getPinnedDashboardsForLevel(accessLevel);

  const filteredApps =
    accessLevel === 'low'
      ? ANALYTICS_APPS.filter((a) => ['dashboards', 'quick-facts'].includes(a.id))
      : accessLevel === 'medium'
        ? ANALYTICS_APPS.filter((a) =>
            ['dashboards', 'quick-facts', 'exports', 'goals'].includes(a.id)
          )
        : ANALYTICS_APPS;

  const pageActions = useMemo(
    () => [
      {
        key: 'pin',
        icon: Pin,
        label: 'Manage pinned dashboards',
        variant: 'tertiary' as const,
        onAction: () => {
          /* TODO: Open pin sheet */
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
        onAction: () => router.push(buildUrl('/analytics/request')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  const handleDashboardNavigate = useCallback(
    (dashboard: PinnedDashboard) => {
      setExpandedDashboard(null);
      // Small delay to let the exit animation play
      setTimeout(() => {
        router.push(buildUrl(dashboard.route));
      }, 200);
    },
    [router, buildUrl]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Category Header */}
      <header>
        <SectionHeader
          title="Analytics"
          subtitle="Insights and data for your ministry"
          icon={BarChart3}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* Pinned - dashboards + quick facts in one row */}
      {(pinnedDashboards.length > 0 || QUICK_FACTS.length > 0) && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle
            icon={Pin}
            title="Pinned"
            subtitle="Your pinned dashboards and quick facts"
          />
          <HorizontalScroll>
            {pinnedDashboards.map((dashboard) => (
              <DashboardSparkCard
                key={dashboard.id}
                dashboard={dashboard}
                onClick={() => router.push(buildUrl(dashboard.route))}
                onExpand={() => setExpandedDashboard(dashboard)}
              />
            ))}
            {QUICK_FACTS.map((fact) => (
              <QuickFactSparkCard
                key={fact.id}
                fact={fact}
                onClick={() => router.push(buildUrl('/analytics/quick-facts'))}
              />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* Apps Grid */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Analytics tools" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              name={app.name}
              description={app.description}
              icon={app.icon}
              onClick={() => router.push(buildUrl(app.route))}
            />
          ))}
        </div>
      </section>

      {/* Dashboard Expand Modal */}
      <AnimatePresence>
        {expandedDashboard && (
          <DashboardExpandModal
            dashboard={expandedDashboard}
            onClose={() => setExpandedDashboard(null)}
            onNavigate={() => handleDashboardNavigate(expandedDashboard)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
