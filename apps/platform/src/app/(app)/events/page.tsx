'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Hash, DoorOpen, Rocket } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { useTrackPageVisit } from '@/lib/useTrackPageVisit';

// Apps within the Events category — matches what's in Neon
const EVENTS_APPS = [
  {
    id: 'counter',
    name: 'Counter',
    description: 'Track attendance counts',
    icon: Hash,
    route: '/events/counter',
  },
  {
    id: 'room-manager',
    name: 'Room Manager',
    description: 'Manage event room assignments and check-ins',
    icon: DoorOpen,
    route: '/events/room-manager',
  },
];

export default function EventsCategoryPage() {
  const router = useRouter();
  const { buildUrl } = usePreserveParams();

  useEffect(() => {
    document.title = 'Events | The Hub';
  }, []);

  useTrackPageVisit({
    resultType: 'app',
    resultId: 'events',
    resultTitle: 'Events',
    resultRoute: '/events',
    resultIcon: 'calendar-days',
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionHeader
          title="Events"
          subtitle="Manage calendars, registrations, and attendance"
          icon={Calendar}
          variant="watermark"
          className="mb-0"
        />
      </header>

      {/* Apps Grid */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Event management tools" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {EVENTS_APPS.map((app) => (
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
