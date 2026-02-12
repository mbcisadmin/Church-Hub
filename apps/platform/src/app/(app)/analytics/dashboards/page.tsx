'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Lock,
  Search,
  Plus,
  Pin,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  DollarSign,
  Church,
  Handshake,
  UsersRound,
  Heart,
  GraduationCap,
  Baby,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { SectionHeader } from '@/components/ui/section-header';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { Sparkline } from '@church/nextjs-ui/components/Sparkline';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { Icon } from '@/lib/icons';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import ChurchLogo from '@/components/ChurchLogo';

interface Dashboard {
  id: number;
  name: string;
  description: string | null;
  route: string;
  icon: string;
}

// Pinned dashboards with sparkline data
const PINNED_DASHBOARDS = [
  {
    id: 'circles',
    title: 'Circles',
    category: 'Engagement',
    stat: '24.3k',
    statLabel: 'people',
    route: '/analytics/dashboards/circles',
    sparkData: [18.2, 19.1, 19.8, 20.5, 21.2, 22.0, 22.8, 23.5, 24.3],
    sparkColor: '#22c55e',
    sparkVariant: 'line' as const,
    trend: 'up' as const,
    trendValue: '+8.2%',
    dashIcon: UsersRound,
  },
  {
    id: 'attendance',
    title: 'Attendance',
    category: 'Weekend',
    stat: '1,247',
    statLabel: 'avg',
    route: '/analytics/dashboards/attendance',
    sparkData: [1180, 1220, 1195, 1260, 1230, 1245, 1210, 1255, 1247],
    sparkColor: '#a855f7',
    sparkVariant: 'line' as const,
    trend: 'up' as const,
    trendValue: '+2.3%',
    dashIcon: Church,
  },
  {
    id: 'giving',
    title: 'Giving',
    category: 'Finance',
    stat: '$182k',
    statLabel: 'MTD',
    route: '/analytics/dashboards/giving',
    sparkData: [145, 168, 152, 178, 165, 190, 172, 185, 182],
    sparkColor: '#3b82f6',
    sparkVariant: 'bar' as const,
    trend: 'up' as const,
    trendValue: '+4.1%',
    dashIcon: DollarSign,
  },
];

// Placeholder dashboards shown in the grid (would be from API)
const PLACEHOLDER_DASHBOARDS = [
  {
    id: 'membership',
    name: 'Membership',
    description: 'Growth and retention tracking',
    icon: Users,
    color: '#a855f7',
  },
  {
    id: 'volunteers-dash',
    name: 'Volunteers',
    description: 'Scheduling and fill rates',
    icon: Handshake,
    color: '#f59e0b',
  },
  {
    id: 'groups-dash',
    name: 'Groups',
    description: 'Small group health metrics',
    icon: UsersRound,
    color: '#ec4899',
  },
  {
    id: 'kids',
    name: 'Kids Ministry',
    description: 'Check-in and attendance',
    icon: Baby,
    color: '#22c55e',
  },
  {
    id: 'discipleship',
    name: 'Discipleship',
    description: 'Growth track progress',
    icon: GraduationCap,
    color: '#3b82f6',
  },
  {
    id: 'care',
    name: 'Care Ministry',
    description: 'Cases and follow-ups',
    icon: Heart,
    color: '#ef4444',
  },
];

function PinnedDashboardCard({
  dashboard,
  onClick,
}: {
  dashboard: (typeof PINNED_DASHBOARDS)[number];
  onClick: () => void;
}) {
  const TrendIcon =
    dashboard.trend === 'up' ? TrendingUp : dashboard.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    dashboard.trend === 'up'
      ? 'text-green-500'
      : dashboard.trend === 'down'
        ? 'text-red-500'
        : 'text-muted-foreground';
  const DashIcon = dashboard.dashIcon;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card border-border group relative flex h-44 w-36 flex-shrink-0 flex-col overflow-hidden rounded-xl border p-3 shadow-md transition-shadow duration-200 hover:shadow-lg focus:outline-none"
    >
      <DashIcon className="text-muted-foreground/5 absolute right-1 bottom-1 h-14 w-14" />

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

      <div className="relative z-10 mx-auto mt-1">
        <Sparkline
          data={dashboard.sparkData}
          color={dashboard.sparkColor}
          variant={dashboard.sparkVariant}
          width={100}
          height={28}
          filled={dashboard.sparkVariant === 'line'}
          fillOpacity={0.1}
        />
      </div>

      <div className="relative z-10 mt-auto w-full text-center">
        <p className="text-foreground text-xs leading-tight font-bold tracking-wide uppercase">
          {dashboard.title}
        </p>
        <div className={`flex items-center justify-center gap-0.5 ${trendColor}`}>
          <TrendIcon className="h-2.5 w-2.5" />
          <span className="text-[9px] font-medium">{dashboard.trendValue}</span>
        </div>
      </div>
    </motion.button>
  );
}

function DashboardGridCard({
  dashboard,
  onClick,
}: {
  dashboard: Dashboard | (typeof PLACEHOLDER_DASHBOARDS)[number];
  onClick: () => void;
}) {
  const isPlaceholder = 'color' in dashboard;
  const PlaceholderIcon = isPlaceholder
    ? (dashboard as (typeof PLACEHOLDER_DASHBOARDS)[number]).icon
    : null;
  const color = isPlaceholder
    ? (dashboard as (typeof PLACEHOLDER_DASHBOARDS)[number]).color
    : undefined;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card border-border hover:bg-muted/30 relative flex h-32 w-full flex-col items-start justify-end overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none"
    >
      {isPlaceholder && PlaceholderIcon ? (
        <PlaceholderIcon
          className="absolute top-2 right-2 h-16 w-16 opacity-[0.06]"
          style={{ color }}
        />
      ) : (
        <Icon
          name={
            'icon' in dashboard && typeof dashboard.icon === 'string' ? dashboard.icon : 'BarChart3'
          }
          className="text-muted-foreground absolute top-2 right-2 h-16 w-16 opacity-5"
        />
      )}

      {/* Color accent bar */}
      {color && (
        <div
          className="absolute top-0 left-0 h-1 w-full"
          style={{ backgroundColor: color, opacity: 0.6 }}
        />
      )}

      <div className="relative z-10">
        <p className="text-foreground text-sm font-bold tracking-wide uppercase">
          {isPlaceholder
            ? (dashboard as (typeof PLACEHOLDER_DASHBOARDS)[number]).name
            : (dashboard as Dashboard).name}
        </p>
        <p className="text-muted-foreground text-xs">
          {isPlaceholder
            ? (dashboard as (typeof PLACEHOLDER_DASHBOARDS)[number]).description
            : (dashboard as Dashboard).description}
        </p>
      </div>
    </motion.button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
      <section className="relative flex flex-col items-center">
        <SectionHeader
          title="No Dashboards"
          subtitle="You don't have access to any dashboards yet"
          icon={Lock}
          variant="watermark"
          as="h1"
          className="mb-4"
        />
        <p className="text-muted-foreground max-w-md text-sm tracking-wide md:text-base">
          If you think this is a mistake, reach out to your supervisor or the tech team.
        </p>
      </section>
    </div>
  );
}

export default function DashboardsPage() {
  const router = useRouter();
  const { status } = useSession();
  const isAuthLoading = status === 'loading';
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);

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
        label: 'Search dashboards',
        variant: 'secondary' as const,
        onAction: () => {
          /* TODO: Open search sheet scoped to Dashboards */
        },
      },
      {
        key: 'request',
        icon: Plus,
        label: 'Request dashboard',
        variant: 'primary' as const,
        onAction: () => router.push('/analytics/request'),
      },
    ],
    [router]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Dashboards | The Hub';

    async function fetchDashboards() {
      try {
        const response = await fetch('/api/permissions/apps?type=dashboard');
        if (response.ok) {
          const data = await response.json();
          setDashboards(data.apps || []);
        }
      } catch (error) {
        console.error('Error fetching dashboards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboards();
  }, []);

  if (isAuthLoading || loading) {
    return (
      <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
        <section className="relative flex flex-col items-center">
          <SectionHeader
            title="Loading"
            subtitle="Getting dashboards ready"
            icon={BarChart3}
            variant="watermark"
            as="h1"
            className="mb-8 md:mb-16"
          />
          <LogoSpinner logo={<ChurchLogo className="text-foreground" />} />
        </section>
      </div>
    );
  }

  // Combine API dashboards with placeholder dashboards
  const hasApiDashboards = dashboards.length > 0;

  if (!hasApiDashboards && PLACEHOLDER_DASHBOARDS.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header>
        <SectionHeader
          title="Dashboards"
          subtitle="Data visualizations and reports"
          icon={BarChart3}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* Pinned Section - with sparklines */}
      {PINNED_DASHBOARDS.length > 0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle icon={Pin} title="Pinned" subtitle="Your favorite dashboards" />
          <HorizontalScroll>
            {PINNED_DASHBOARDS.map((item) => (
              <PinnedDashboardCard
                key={item.id}
                dashboard={item}
                onClick={() => router.push(item.route)}
              />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* API Dashboards Grid */}
      {hasApiDashboards && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle
            icon={BarChart3}
            title="All Dashboards"
            subtitle="Available reports and analytics"
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {dashboards.map((dashboard) => (
              <DashboardGridCard
                key={dashboard.id}
                dashboard={dashboard}
                onClick={() => {
                  // Normalize legacy routes missing /analytics prefix
                  const route = dashboard.route.startsWith('/dashboards')
                    ? `/analytics${dashboard.route}`
                    : dashboard.route;
                  router.push(route);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Placeholder Dashboards */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle
          icon={BarChart3}
          title={hasApiDashboards ? 'Coming Soon' : 'All Dashboards'}
          subtitle={
            hasApiDashboards ? 'Dashboards in development' : 'Available reports and analytics'
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {PLACEHOLDER_DASHBOARDS.map((dashboard) => (
            <DashboardGridCard
              key={dashboard.id}
              dashboard={dashboard}
              onClick={() => {
                /* Placeholder - not yet built */
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
