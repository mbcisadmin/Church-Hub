import { fetchFilters, fetchParticipants } from '../../_data/fetchers';
import CurrentTab from '../tabs/CurrentTab';
import TabReadyMarker from '../TabReadyMarker';

export default async function CurrentTabStream() {
  const [filterConfigs, participants] = await Promise.all([fetchFilters(), fetchParticipants()]);

  return (
    <>
      <TabReadyMarker tab="current" />
      <CurrentTab filterConfigs={filterConfigs} participants={participants} />
    </>
  );
}
