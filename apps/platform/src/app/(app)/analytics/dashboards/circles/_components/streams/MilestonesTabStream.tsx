import { fetchMilestones } from '../../_data/fetchers';
import MilestonesTab from '../tabs/MilestonesTab';
import TabReadyMarker from '../TabReadyMarker';

export default async function MilestonesTabStream() {
  const sections = await fetchMilestones();

  return (
    <>
      <TabReadyMarker tab="milestones" />
      <MilestonesTab sections={sections} />
    </>
  );
}
