'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Rocket } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { DashboardCard } from '@church/nextjs-ui/components/DashboardCard';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { useTrackPageVisit } from '@/lib/useTrackPageVisit';

const DASHBOARDS = [
  {
    id: 'circles',
    title: 'Circles',
    category: 'Engagement',
    stat: '24.3k',
    statLabel: 'people',
    route: '/analytics/dashboards/circles',
  },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const { buildUrl } = usePreserveParams();

  useEffect(() => {
    document.title = 'Analytics | The Hub';
  }, []);

  useTrackPageVisit({
    resultType: 'app',
    resultId: 'analytics',
    resultTitle: 'Analytics',
    resultRoute: '/analytics',
    resultIcon: 'bar-chart-3',
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionHeader
          title="Analytics"
          subtitle="Dashboards and insights"
          icon={BarChart3}
          variant="watermark"
          className="mb-0"
        />
      </header>

      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Dashboards" subtitle="Explore your data" />
        <HorizontalScroll>
          {DASHBOARDS.map((d) => (
            <DashboardCard
              key={d.id}
              title={d.title}
              category={d.category}
              stat={d.stat}
              statLabel={d.statLabel}
              onClick={() => router.push(buildUrl(d.route))}
            />
          ))}
        </HorizontalScroll>
      </section>
    </div>
  );
}
