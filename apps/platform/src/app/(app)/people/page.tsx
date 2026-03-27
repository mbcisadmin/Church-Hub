'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Rocket } from 'lucide-react';
import { SectionHeader } from '@church/nextjs-ui/components/SectionHeader';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { useTrackPageVisit } from '@/lib/useTrackPageVisit';

// Apps within the People category — matches what's in Neon
const PEOPLE_APPS = [
  {
    id: 'people-search',
    name: 'People Search',
    description: 'Search and view contact information',
    icon: Search,
    route: '/people/search',
  },
];

export default function PeoplePage() {
  const router = useRouter();
  const { buildUrl } = usePreserveParams();

  useEffect(() => {
    document.title = 'People | The Hub';
  }, []);

  useTrackPageVisit({
    resultType: 'app',
    resultId: 'people',
    resultTitle: 'People',
    resultRoute: '/people',
    resultIcon: 'search',
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionHeader
          title="People"
          subtitle="Find and connect with your community"
          icon={Users}
          variant="watermark"
          className="mb-0"
        />
      </header>

      {/* Apps Grid */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Tools for managing people" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {PEOPLE_APPS.map((app) => (
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
