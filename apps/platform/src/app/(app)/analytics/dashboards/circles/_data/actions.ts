'use server';

import { fetchOverTimeData } from './fetchers';
import type { OverTimeData } from './types';

/**
 * Server action to fetch over-time data for a specific fiscal period.
 * Called when user changes the "As Of" dropdown.
 */
export async function getOverTimeData(fiscalPeriodId: number): Promise<OverTimeData> {
  return fetchOverTimeData(fiscalPeriodId);
}
