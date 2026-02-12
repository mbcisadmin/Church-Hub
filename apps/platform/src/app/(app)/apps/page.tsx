'use client';

import { useEffect, useState } from 'react';
import { Rocket, Lock, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { SectionHeader } from '@/components/ui/section-header';
import { AppCard } from '@/components/AppCard';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import ChurchLogo from '@/components/ChurchLogo';

interface App {
  id: number;
  name: string;
  description: string | null;
  route: string;
  icon: string;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
      <section className="relative flex flex-col items-center">
        <SectionHeader
          title="No Apps Available"
          subtitle="You don't have access to any apps yet"
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

export default function AppsPage() {
  const { status } = useSession();
  const isLoading = status === 'loading';
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Apps | The Hub';

    async function fetchApps() {
      try {
        const response = await fetch('/api/permissions/apps?type=app');
        if (response.ok) {
          const data = await response.json();
          setApps(data.apps || []);
        }
      } catch (error) {
        console.error('Error fetching apps:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchApps();
  }, []);

  if (isLoading || loading) {
    return (
      <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
        <section className="relative flex flex-col items-center">
          <SectionHeader
            title="Loading"
            subtitle="Getting apps ready"
            icon={Loader2}
            variant="watermark"
            as="h1"
            className="mb-8 md:mb-16"
          />
          <LogoSpinner logo={<ChurchLogo className="text-foreground" />} />
        </section>
      </div>
    );
  }

  if (apps.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-background py-8 md:pt-16">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6">
        <section className="relative">
          <SectionHeader
            title="Apps"
            subtitle="Tools and utilities for your team"
            icon={Rocket}
            variant="watermark"
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {apps.map((app) => (
              <AppCard
                key={app.id}
                name={app.name}
                description={app.description}
                route={app.route}
                icon={app.icon || 'Rocket'}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
