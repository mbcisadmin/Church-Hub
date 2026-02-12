'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  HandHeart,
  Plus,
  Heart,
  Clock,
  Users,
  MessageSquare,
  Rocket,
  CheckCircle2,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { usePreserveParams } from '@/lib/usePreserveParams';

const PRAYER_REQUESTS = [
  {
    id: '1',
    title: 'Healing for my mother',
    author: 'Sarah W.',
    date: '2 hours ago',
    prayerCount: 24,
    isUrgent: true,
    category: 'Health',
  },
  {
    id: '2',
    title: 'Job interview tomorrow',
    author: 'Mike T.',
    date: '5 hours ago',
    prayerCount: 18,
    isUrgent: false,
    category: 'Work',
  },
  {
    id: '3',
    title: 'Safe travels for mission team',
    author: 'Pastor Dave',
    date: '1 day ago',
    prayerCount: 47,
    isUrgent: false,
    category: 'Missions',
  },
  {
    id: '4',
    title: 'Strength during difficult season',
    author: 'Anonymous',
    date: '2 days ago',
    prayerCount: 31,
    isUrgent: false,
    category: 'Personal',
  },
];

const MY_REQUESTS = [
  {
    id: 'm1',
    title: 'Wisdom for a big decision',
    date: 'Feb 8, 2026',
    prayerCount: 12,
    status: 'active',
  },
  {
    id: 'm2',
    title: 'Healing after surgery',
    date: 'Jan 20, 2026',
    prayerCount: 35,
    status: 'answered',
  },
];

const PRAYER_APPS = [
  {
    id: 'all',
    name: 'All Requests',
    description: 'Browse community prayer requests',
    icon: Users,
    route: '/prayer',
  },
  {
    id: 'mine',
    name: 'My Requests',
    description: 'Manage your prayer requests',
    icon: MessageSquare,
    route: '/prayer/my-requests',
  },
  {
    id: 'praying-for',
    name: 'Praying For',
    description: "Requests you're praying for",
    icon: Heart,
    route: '/prayer/praying-for',
  },
];

export default function PrayerPage() {
  const router = useRouter();
  const { buildUrl } = usePreserveParams();

  const pageActions = useMemo(
    () => [
      {
        key: 'submit',
        icon: Plus,
        label: 'Submit prayer request',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/prayer/submit')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Prayer | The Hub';
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionHeader
          title="Prayer"
          subtitle="Bear one another's burdens"
          icon={HandHeart}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* Quick Stats */}
      <section className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-4 text-center shadow-sm">
          <p className="text-foreground text-2xl font-bold">{PRAYER_REQUESTS.length}</p>
          <span className="text-muted-foreground text-xs">Active Requests</span>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center shadow-sm">
          <p className="text-foreground text-2xl font-bold">
            {PRAYER_REQUESTS.reduce((sum, r) => sum + r.prayerCount, 0)}
          </p>
          <span className="text-muted-foreground text-xs">Prayers This Week</span>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center shadow-sm">
          <p className="text-foreground text-2xl font-bold">
            {MY_REQUESTS.filter((r) => r.status === 'answered').length}
          </p>
          <span className="text-muted-foreground text-xs">Answered Prayers</span>
        </div>
      </section>

      {/* Community Prayer Requests */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle
          icon={Users}
          title="Community Requests"
          subtitle="Pray for others in your church family"
          action="View all"
          onAction={() => router.push(buildUrl('/prayer'))}
        />
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
          {PRAYER_REQUESTS.map((request) => (
            <button
              key={request.id}
              onClick={() => router.push(buildUrl(`/prayer/${request.id}`))}
              className="hover:bg-muted/50 flex w-full items-center justify-between border-b p-4 text-left transition-colors last:border-b-0"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  {request.isUrgent && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                      Urgent
                    </span>
                  )}
                  <span className="text-foreground text-sm font-medium">{request.title}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {request.author} · {request.date} · {request.category}
                </span>
              </div>
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Heart className="h-3 w-3" />
                {request.prayerCount}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* My Requests */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle
          icon={MessageSquare}
          title="My Requests"
          subtitle="Your submitted prayer requests"
          action="View all"
          onAction={() => router.push(buildUrl('/prayer/my-requests'))}
        />
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
          {MY_REQUESTS.map((request) => (
            <button
              key={request.id}
              onClick={() => router.push(buildUrl(`/prayer/my-requests/${request.id}`))}
              className="hover:bg-muted/50 flex w-full items-center justify-between border-b p-4 text-left transition-colors last:border-b-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground text-sm font-medium">{request.title}</span>
                <span className="text-muted-foreground text-xs">{request.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Heart className="h-3 w-3" />
                  {request.prayerCount}
                </span>
                {request.status === 'answered' && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Apps */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Prayer tools" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {PRAYER_APPS.map((app) => (
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
    </div>
  );
}
