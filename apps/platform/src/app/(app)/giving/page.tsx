'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Heart,
  Lock,
  Search,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  CreditCard,
  PiggyBank,
  Gift,
  Rocket,
  Users,
  Building2,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/ui/section-header';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { DashboardCard } from '@church/nextjs-ui/components/DashboardCard';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import ChurchLogo from '@/components/ChurchLogo';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { churchConfig } from '@/config/church';

// Mock giving summary data
const GIVING_SUMMARY = {
  ytd: '$4,250.00',
  ytdVsLastYear: '+12%',
  lastGift: '$250.00',
  lastGiftDate: 'Feb 5, 2026',
  recurringAmount: '$500.00',
  recurringFrequency: 'Monthly',
  pledgeProgress: 75,
  pledgeAmount: '$6,000.00',
};

// Mock giving history
const GIVING_HISTORY = [
  { id: '1', amount: '$250.00', date: 'Feb 5, 2026', fund: 'General Fund', method: 'Online' },
  { id: '2', amount: '$500.00', date: 'Jan 15, 2026', fund: 'General Fund', method: 'Recurring' },
  { id: '3', amount: '$100.00', date: 'Jan 5, 2026', fund: 'Missions', method: 'Online' },
  { id: '4', amount: '$500.00', date: 'Dec 15, 2025', fund: 'General Fund', method: 'Recurring' },
  {
    id: '5',
    amount: '$1,000.00',
    date: 'Dec 24, 2025',
    fund: 'Christmas Offering',
    method: 'Online',
  },
];

// Apps within the Giving category
const GIVING_APPS = [
  {
    id: 'give-now',
    name: 'Give Now',
    description: 'Make a one-time gift',
    icon: Heart,
    route: '/giving/give',
  },
  {
    id: 'recurring',
    name: 'Recurring',
    description: 'Manage scheduled giving',
    icon: Calendar,
    route: '/giving/recurring',
  },
  {
    id: 'history',
    name: 'History',
    description: 'View all transactions',
    icon: FileText,
    route: '/giving/history',
  },
  {
    id: 'payment-methods',
    name: 'Payment Methods',
    description: 'Manage cards and accounts',
    icon: CreditCard,
    route: '/giving/payment-methods',
  },
  {
    id: 'pledges',
    name: 'Pledges',
    description: 'View and track pledges',
    icon: PiggyBank,
    route: '/giving/pledges',
  },
  {
    id: 'statements',
    name: 'Statements',
    description: 'Download tax statements',
    icon: FileText,
    route: '/giving/statements',
  },
];

// Admin apps (only for medium/high access)
const ADMIN_APPS = [
  {
    id: 'batch-manager',
    name: 'Batch Manager',
    description: 'Process donation batches',
    icon: Users,
    route: '/giving/batches',
  },
  {
    id: 'fund-manager',
    name: 'Fund Manager',
    description: 'Manage giving funds',
    icon: Building2,
    route: '/giving/funds',
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Giving analytics',
    icon: BarChart3,
    route: '/giving/reports',
  },
];

// Quick stat card component
function QuickStatCard({
  label,
  value,
  sublabel,
  trend,
  onClick,
}: {
  label: string;
  value: string;
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : '';

  return (
    <motion.button
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      disabled={!onClick}
      className={`bg-card relative flex flex-col rounded-xl border p-4 text-left shadow-sm transition-all ${
        onClick ? 'hover:bg-muted/50 cursor-pointer hover:shadow-md' : 'cursor-default'
      }`}
    >
      <span className="text-muted-foreground text-xs font-medium uppercase">{label}</span>
      <span className="text-foreground mt-1 text-2xl font-bold">{value}</span>
      {sublabel && (
        <span
          className={`mt-1 flex items-center gap-1 text-xs ${trendColor || 'text-muted-foreground'}`}
        >
          {TrendIcon && <TrendIcon className="h-3 w-3" />}
          {sublabel}
        </span>
      )}
    </motion.button>
  );
}

// Transaction row component
function TransactionRow({
  transaction,
  onClick,
}: {
  transaction: (typeof GIVING_HISTORY)[0];
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      className="flex w-full items-center justify-between border-b px-4 py-3 text-left last:border-b-0"
    >
      <div className="flex flex-col">
        <span className="text-foreground text-sm font-medium">{transaction.fund}</span>
        <span className="text-muted-foreground text-xs">
          {transaction.date} • {transaction.method}
        </span>
      </div>
      <span className="text-foreground text-sm font-bold">{transaction.amount}</span>
    </motion.button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
      <section className="relative flex flex-col items-center">
        <SectionHeader
          title="Giving"
          subtitle="Your generosity makes an impact"
          icon={Heart}
          variant="watermark"
          as="h1"
          className="mb-4"
        />
        <p className="text-muted-foreground max-w-md text-sm tracking-wide md:text-base">
          Start your giving journey with {churchConfig.name}. Every gift helps us reach more people
          with the love of Christ.
        </p>
      </section>
    </div>
  );
}

export default function GivingPage() {
  const router = useRouter();
  const { status } = useSession();
  const { accessLevel } = useTestingContext();
  const { buildUrl } = usePreserveParams();
  const isAuthLoading = status === 'loading';
  const [loading, setLoading] = useState(true);

  const pageActions = useMemo(
    () => [
      {
        key: 'history',
        icon: Search,
        label: 'Search transactions',
        variant: 'secondary' as const,
        onAction: () => router.push(buildUrl('/giving/history')),
      },
      {
        key: 'give',
        icon: Heart,
        label: 'Give now',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/giving/give')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Giving | The Hub';
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Get apps based on access level
  const personalApps = accessLevel === 'low' ? GIVING_APPS.slice(0, 3) : GIVING_APPS;

  const adminApps = accessLevel === 'high' ? ADMIN_APPS : [];

  // Get history based on access level
  const history =
    accessLevel === 'low'
      ? GIVING_HISTORY.slice(0, 2)
      : accessLevel === 'medium'
        ? GIVING_HISTORY.slice(0, 3)
        : GIVING_HISTORY;

  if (isAuthLoading || loading) {
    return (
      <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
        <section className="relative flex flex-col items-center">
          <SectionHeader
            title="Loading"
            subtitle="Getting your giving information"
            icon={Heart}
            variant="watermark"
            as="h1"
            className="mb-8 md:mb-16"
          />
          <LogoSpinner logo={<ChurchLogo className="text-foreground" />} />
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Category Header */}
      <header>
        <SectionHeader
          title="Giving"
          subtitle="Your generosity at a glance"
          icon={Heart}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <QuickStatCard
          label="Year to Date"
          value={GIVING_SUMMARY.ytd}
          sublabel={`${GIVING_SUMMARY.ytdVsLastYear} vs last year`}
          trend="up"
        />
        <QuickStatCard
          label="Last Gift"
          value={GIVING_SUMMARY.lastGift}
          sublabel={GIVING_SUMMARY.lastGiftDate}
        />
        <QuickStatCard
          label="Recurring"
          value={GIVING_SUMMARY.recurringAmount}
          sublabel={GIVING_SUMMARY.recurringFrequency}
          onClick={() => router.push(buildUrl('/giving/recurring'))}
        />
        <QuickStatCard
          label="Pledge Progress"
          value={`${GIVING_SUMMARY.pledgeProgress}%`}
          sublabel={`of ${GIVING_SUMMARY.pledgeAmount}`}
          onClick={() => router.push(buildUrl('/giving/pledges'))}
        />
      </section>

      {/* Recent Transactions */}
      {history.length > 0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle
            icon={FileText}
            title="Recent Gifts"
            subtitle="Your latest transactions"
            action="View all"
            onAction={() => router.push(buildUrl('/giving/history'))}
          />
          <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
            {history.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onClick={() => router.push(buildUrl(`/giving/transactions/${transaction.id}`))}
              />
            ))}
          </div>
        </section>
      )}

      {/* Apps */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Tools for managing your giving" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {personalApps.map((app) => (
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

      {/* Admin Tools (only for medium/high access) */}
      {adminApps.length > 0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle icon={BarChart3} title="Admin Tools" subtitle="Manage church giving" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {adminApps.map((app) => (
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
      )}

      {/* Dashboards (only for medium/high access) */}
      {accessLevel !== 'low' && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle icon={BarChart3} title="Dashboards" subtitle="Giving insights" />
          <HorizontalScroll>
            <DashboardCard
              title="Monthly Giving"
              category="Finance"
              stat="$182k"
              statLabel="this month"
              onClick={() => router.push(buildUrl('/analytics/dashboards/giving'))}
            />
            <DashboardCard
              title="Year Over Year"
              category="Finance"
              stat="+8%"
              statLabel="growth"
              onClick={() => router.push(buildUrl('/analytics/dashboards/giving/yoy'))}
            />
            <DashboardCard
              title="Fund Distribution"
              category="Finance"
              stat="12"
              statLabel="active funds"
              onClick={() => router.push(buildUrl('/analytics/dashboards/giving/funds'))}
            />
          </HorizontalScroll>
        </section>
      )}
    </div>
  );
}
