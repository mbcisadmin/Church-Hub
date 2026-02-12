'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Church,
  Users,
  Heart,
  HandHeart,
  MapPin,
  Phone,
  Globe,
  Rocket,
  Search,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { churchConfig } from '@/config/church';

const QUICK_STATS = [
  { label: 'Weekend Attendance', value: '4,832', sublabel: 'Last Sunday' },
  { label: 'Active Volunteers', value: '1,247', sublabel: 'This month' },
  { label: 'Small Groups', value: '186', sublabel: 'Active groups' },
  { label: 'Campuses', value: '3', sublabel: 'Main · North · Online' },
];

const CHURCH_APPS = [
  {
    id: 'care-teams',
    name: 'Care Teams',
    description: 'Coordinate care ministry',
    icon: Heart,
    route: '/church/care-teams',
  },
  {
    id: 'directory',
    name: 'Directory',
    description: 'Find staff and ministry leaders',
    icon: Users,
    route: '/church/directory',
  },
  {
    id: 'volunteers',
    name: 'Volunteers',
    description: 'Volunteer management overview',
    icon: HandHeart,
    route: '/church/volunteers',
  },
];

export default function ChurchPage() {
  const router = useRouter();
  const { buildUrl } = usePreserveParams();

  const pageActions = useMemo(
    () => [
      {
        key: 'directory',
        icon: Search,
        label: 'Search directory',
        variant: 'secondary' as const,
        onAction: () => router.push(buildUrl('/church/directory')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Church | The Hub';
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionHeader
          title="Church"
          subtitle={`${churchConfig.name} overview`}
          icon={Church}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {QUICK_STATS.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border p-4 shadow-sm">
            <span className="text-muted-foreground text-xs font-medium uppercase">
              {stat.label}
            </span>
            <p className="text-foreground mt-1 text-2xl font-bold">{stat.value}</p>
            <span className="text-muted-foreground text-xs">{stat.sublabel}</span>
          </div>
        ))}
      </section>

      {/* Church Info */}
      <section className="bg-card rounded-xl border p-6 shadow-sm">
        <h3 className="text-muted-foreground mb-4 text-xs font-semibold tracking-wide uppercase">
          Contact Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-foreground text-sm">123 Main Street, Anytown, USA 12345</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-foreground text-sm">(555) 123-4567</span>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="text-muted-foreground h-4 w-4 shrink-0" />
            <a
              href={churchConfig.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm hover:underline"
            >
              {churchConfig.websiteUrl.replace(/^https?:\/\//, '')}
            </a>
          </div>
        </div>
      </section>

      {/* Apps */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Church management tools" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {CHURCH_APPS.map((app) => (
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
