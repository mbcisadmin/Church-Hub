'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { DashboardCard } from '@church/nextjs-ui/components/DashboardCard';
import { usePreserveParams } from '@/lib/usePreserveParams';

const DASHBOARDS = [
  {
    id: 'circles',
    title: 'Circles',
    category: 'Engagement',
    description:
      'Concentric circles model — track how people move from the community into the core of your church.',
    stat: '24.3k',
    statLabel: 'people',
    route: '/analytics/dashboards/circles',
  },
];

export default function DashboardsPage() {
  const router = useRouter();
  const { buildUrl } = usePreserveParams();

  useEffect(() => {
    document.title = 'Dashboards | The Hub';
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionHeader
          title="Dashboards"
          subtitle="Each dashboard is custom-built to surface the metrics that matter most"
          icon={LayoutDashboard}
          variant="watermark"
          className="mb-0"
        />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </div>
  );
}
