import { Suspense } from 'react';
import CirclesDashboard from './_components/CirclesDashboard';
import { TabReadyProvider } from './_components/TabReadyProvider';
import CurrentTabStream from './_components/streams/CurrentTabStream';
import MilestonesTabStream from './_components/streams/MilestonesTabStream';
import CurrentTabSkeleton from './_components/skeletons/CurrentTabSkeleton';
import MilestonesTabSkeleton from './_components/skeletons/MilestonesTabSkeleton';
import { fetchOverTimeData } from './_data/fetchers';

export const dynamic = 'force-dynamic';

export default async function CirclesPage() {
  const overTimeData = await fetchOverTimeData();

  return (
    <TabReadyProvider>
      <CirclesDashboard
        overTimeData={overTimeData}
        currentSlot={
          <Suspense fallback={<CurrentTabSkeleton />}>
            <CurrentTabStream />
          </Suspense>
        }
        milestonesSlot={
          <Suspense fallback={<MilestonesTabSkeleton />}>
            <MilestonesTabStream />
          </Suspense>
        }
      />
    </TabReadyProvider>
  );
}
