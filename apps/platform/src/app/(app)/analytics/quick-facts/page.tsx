'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Church,
  Heart,
  HandCoins,
  Minus,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { Sparkline } from '@church/nextjs-ui/components/Sparkline';

// Quick Facts organized by category - now with sparkline data
const QUICK_FACTS = {
  weekend: [
    {
      id: '1',
      title: 'Attendance',
      stat: '1,247',
      statLabel: 'this week',
      trend: 'up' as const,
      trendValue: '+12%',
      icon: Users,
      sparkData: [980, 1050, 1120, 1080, 1180, 1220, 1195, 1247],
      sparkColor: '#a855f7',
    },
    {
      id: '2',
      title: 'First Time',
      stat: '23',
      statLabel: 'guests',
      trend: 'up' as const,
      trendValue: '+5',
      icon: TrendingUp,
      sparkData: [15, 18, 12, 20, 16, 22, 19, 23],
      sparkColor: '#22c55e',
    },
    {
      id: '3',
      title: 'Services',
      stat: '4',
      statLabel: 'this week',
      trend: 'neutral' as const,
      icon: Church,
      sparkData: [4, 4, 4, 4, 3, 4, 4, 4],
      sparkColor: '#6b7280',
    },
    {
      id: '4',
      title: 'Online',
      stat: '342',
      statLabel: 'views',
      trend: 'down' as const,
      trendValue: '-8%',
      icon: Users,
      sparkData: [410, 380, 395, 370, 365, 358, 350, 342],
      sparkColor: '#ef4444',
    },
  ],
  giving: [
    {
      id: '5',
      title: 'This Week',
      stat: '$48.2k',
      statLabel: 'total',
      trend: 'up' as const,
      trendValue: '+15%',
      icon: DollarSign,
      sparkData: [32, 38, 41, 35, 44, 42, 46, 48.2],
      sparkColor: '#3b82f6',
    },
    {
      id: '6',
      title: 'Monthly Avg',
      stat: '$186k',
      statLabel: 'per month',
      trend: 'up' as const,
      trendValue: '+3%',
      icon: HandCoins,
      sparkData: [168, 172, 175, 178, 180, 182, 184, 186],
      sparkColor: '#3b82f6',
    },
    {
      id: '7',
      title: 'YTD',
      stat: '$1.1M',
      statLabel: 'total',
      trend: 'neutral' as const,
      icon: DollarSign,
      sparkData: [0, 168, 340, 520, 700, 880, 990, 1100],
      sparkColor: '#6b7280',
    },
    {
      id: '8',
      title: 'Recurring',
      stat: '234',
      statLabel: 'donors',
      trend: 'up' as const,
      trendValue: '+8',
      icon: Heart,
      sparkData: [205, 210, 215, 218, 222, 226, 230, 234],
      sparkColor: '#ec4899',
    },
  ],
  groups: [
    {
      id: '9',
      title: 'Active',
      stat: '142',
      statLabel: 'groups',
      trend: 'up' as const,
      trendValue: '+3',
      icon: Users,
      sparkData: [128, 130, 132, 135, 136, 138, 140, 142],
      sparkColor: '#ec4899',
    },
    {
      id: '10',
      title: 'Participants',
      stat: '1,856',
      statLabel: 'members',
      trend: 'up' as const,
      trendValue: '+45',
      icon: Users,
      sparkData: [1650, 1700, 1740, 1780, 1800, 1820, 1840, 1856],
      sparkColor: '#a855f7',
    },
    {
      id: '11',
      title: 'Avg Size',
      stat: '13',
      statLabel: 'per group',
      trend: 'neutral' as const,
      icon: Users,
      sparkData: [12, 13, 12, 13, 13, 12, 13, 13],
      sparkColor: '#6b7280',
    },
    {
      id: '12',
      title: 'New Groups',
      stat: '5',
      statLabel: 'this month',
      trend: 'up' as const,
      trendValue: '+2',
      icon: TrendingUp,
      sparkData: [1, 2, 3, 2, 4, 3, 4, 5],
      sparkColor: '#22c55e',
    },
  ],
  events: [
    {
      id: '13',
      title: 'This Week',
      stat: '8',
      statLabel: 'events',
      trend: 'neutral' as const,
      icon: Calendar,
      sparkData: [6, 8, 7, 9, 8, 7, 8, 8],
      sparkColor: '#6b7280',
    },
    {
      id: '14',
      title: 'Registered',
      stat: '456',
      statLabel: 'people',
      trend: 'up' as const,
      trendValue: '+32',
      icon: Users,
      sparkData: [320, 350, 380, 400, 415, 430, 445, 456],
      sparkColor: '#f59e0b',
    },
    {
      id: '15',
      title: 'Upcoming',
      stat: '23',
      statLabel: 'this month',
      trend: 'up' as const,
      trendValue: '+5',
      icon: Calendar,
      sparkData: [12, 14, 16, 18, 19, 20, 22, 23],
      sparkColor: '#3b82f6',
    },
    {
      id: '16',
      title: 'Volunteers',
      stat: '89',
      statLabel: 'needed',
      trend: 'down' as const,
      trendValue: '-12',
      icon: Heart,
      sparkData: [120, 115, 108, 105, 100, 98, 92, 89],
      sparkColor: '#ef4444',
    },
  ],
};

type QuickFact = {
  id: string;
  title: string;
  stat: string;
  statLabel: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ComponentType<{ className?: string }>;
  sparkData: number[];
  sparkColor: string;
};

function QuickFactCard({ fact }: { fact: QuickFact }) {
  const TrendIcon = fact.trend === 'up' ? TrendingUp : fact.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    fact.trend === 'up'
      ? 'text-green-500'
      : fact.trend === 'down'
        ? 'text-red-500'
        : 'text-muted-foreground';
  const FactIcon = fact.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className="bg-card border-border relative flex h-44 w-40 flex-shrink-0 flex-col items-center overflow-hidden rounded-xl border p-4 shadow-md transition-shadow duration-200 hover:shadow-lg"
    >
      {/* Watermark icon */}
      <FactIcon className="text-muted-foreground/5 absolute right-1 bottom-1 h-16 w-16" />

      {/* Stat block */}
      <div className="relative z-10 text-center">
        <p className="text-foreground text-2xl leading-none font-bold">{fact.stat}</p>
        <p className="text-muted-foreground mt-0.5 text-[10px] font-semibold tracking-wide uppercase">
          {fact.statLabel}
        </p>
      </div>

      {/* Sparkline */}
      <div className="relative z-10 mx-auto mt-2">
        <Sparkline
          data={fact.sparkData}
          color={fact.sparkColor}
          variant="line"
          width={110}
          height={32}
          filled
          fillOpacity={0.1}
        />
      </div>

      {/* Title */}
      <p className="text-foreground relative z-10 mt-auto text-xs font-bold tracking-wide uppercase">
        {fact.title}
      </p>

      {/* Trend indicator */}
      {fact.trendValue && (
        <div className={`relative z-10 mt-0.5 flex items-center gap-0.5 ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          <span className="text-[10px] font-medium">{fact.trendValue}</span>
        </div>
      )}
    </motion.div>
  );
}

export default function QuickFactsPage() {
  useEffect(() => {
    document.title = 'Quick Facts | The Hub';
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header>
        <SectionHeader
          title="Quick Facts"
          subtitle="Key stats at a glance"
          icon={Zap}
          variant="watermark"
          className="mb-0"
        />
      </header>

      {/* Weekend Section */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Church} title="Weekend" subtitle="Service attendance and engagement" />
        <HorizontalScroll>
          {QUICK_FACTS.weekend.map((fact) => (
            <QuickFactCard key={fact.id} fact={fact} />
          ))}
        </HorizontalScroll>
      </section>

      {/* Giving Section */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle
          icon={DollarSign}
          title="Giving"
          subtitle="Financial contributions and trends"
        />
        <HorizontalScroll>
          {QUICK_FACTS.giving.map((fact) => (
            <QuickFactCard key={fact.id} fact={fact} />
          ))}
        </HorizontalScroll>
      </section>

      {/* Groups Section */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Users} title="Groups" subtitle="Small group participation" />
        <HorizontalScroll>
          {QUICK_FACTS.groups.map((fact) => (
            <QuickFactCard key={fact.id} fact={fact} />
          ))}
        </HorizontalScroll>
      </section>

      {/* Events Section */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle
          icon={Calendar}
          title="Events"
          subtitle="Upcoming activities and registrations"
        />
        <HorizontalScroll>
          {QUICK_FACTS.events.map((fact) => (
            <QuickFactCard key={fact.id} fact={fact} />
          ))}
        </HorizontalScroll>
      </section>
    </div>
  );
}
