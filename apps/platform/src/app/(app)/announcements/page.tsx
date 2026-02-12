'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  Search,
  Plus,
  Pin,
  Clock,
  Eye,
  MessageSquare,
  Rocket,
  BarChart3,
  Settings,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';

// Mock announcements
const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Easter Services Schedule',
    category: 'Church-Wide',
    date: 'Feb 10, 2026',
    status: 'active' as const,
    views: 1243,
    isPinned: true,
  },
  {
    id: '2',
    title: 'Volunteer Appreciation Dinner',
    category: 'Serving',
    date: 'Feb 8, 2026',
    status: 'active' as const,
    views: 567,
    isPinned: false,
  },
  {
    id: '3',
    title: 'Small Group Sign-Ups Open',
    category: 'Groups',
    date: 'Feb 5, 2026',
    status: 'active' as const,
    views: 892,
    isPinned: true,
  },
  {
    id: '4',
    title: 'Building Fund Update',
    category: 'Finance',
    date: 'Feb 1, 2026',
    status: 'expired' as const,
    views: 2104,
    isPinned: false,
  },
];

const ANNOUNCEMENT_APPS = [
  {
    id: 'all',
    name: 'All Announcements',
    description: 'Browse all current announcements',
    icon: Megaphone,
    route: '/announcements',
  },
  {
    id: 'mine',
    name: 'My Announcements',
    description: 'Manage announcements you created',
    icon: MessageSquare,
    route: '/announcements/my',
  },
  {
    id: 'widget',
    name: 'Widget Preview',
    description: 'Preview the announcement widget',
    icon: Eye,
    route: '/announcements/widget',
  },
];

const ADMIN_APPS = [
  {
    id: 'manage',
    name: 'Manage All',
    description: 'Approve and manage announcements',
    icon: Settings,
    route: '/announcements/view',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'View announcement engagement',
    icon: BarChart3,
    route: '/announcements/analytics',
  },
];

export default function AnnouncementsPage() {
  const router = useRouter();
  const { accessLevel } = useTestingContext();
  const { buildUrl } = usePreserveParams();

  const pageActions = useMemo(
    () => [
      {
        key: 'search',
        icon: Search,
        label: 'Search announcements',
        variant: 'secondary' as const,
        onAction: () => router.push(buildUrl('/announcements')),
      },
      {
        key: 'create',
        icon: Plus,
        label: 'New announcement',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/announcements/create')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Announcements | The Hub';
  }, []);

  const announcements =
    accessLevel === 'low'
      ? MOCK_ANNOUNCEMENTS.filter((a) => a.status === 'active')
      : MOCK_ANNOUNCEMENTS;
  const adminApps = accessLevel === 'high' ? ADMIN_APPS : [];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionHeader
          title="Announcements"
          subtitle="Keep your church informed"
          icon={Megaphone}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* Active Announcements */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle
          icon={Pin}
          title="Active Announcements"
          subtitle={`${announcements.filter((a) => a.status === 'active').length} currently showing`}
        />
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
          {announcements
            .filter((a) => a.status === 'active')
            .map((announcement) => (
              <button
                key={announcement.id}
                onClick={() => router.push(buildUrl(`/announcements/${announcement.id}`))}
                className="hover:bg-muted/50 flex w-full items-center justify-between border-b p-4 text-left transition-colors last:border-b-0"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {announcement.isPinned && <Pin className="text-primary h-3 w-3" />}
                    <span className="text-foreground text-sm font-medium">
                      {announcement.title}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {announcement.category} · {announcement.date}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Eye className="h-3 w-3" />
                  {announcement.views}
                </div>
              </button>
            ))}
        </div>
      </section>

      {/* Apps */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Announcement tools" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {ANNOUNCEMENT_APPS.map((app) => (
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

      {adminApps.length > 0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle icon={Settings} title="Admin Tools" subtitle="Manage announcements" />
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
    </div>
  );
}
