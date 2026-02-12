import { MinistryPlatformClient, TableService, ProcedureService } from '@church/ministry-platform';

interface Event {
  Event_ID: number;
  Event_Title: string;
  Event_Start_Date: string;
  Event_End_Date: string;
  Congregation_ID: number;
  Event_Type_ID: number;
  Program_ID: number;
}

interface Metric {
  Metric_ID: number;
  Metric_Title: string;
}

interface EventMetric {
  Event_Metric_ID: number;
  Event_ID: number;
  Metric_ID: number;
  Numerical_Value: number;
  Group_ID?: number | null;
  [key: string]: unknown;
}

interface CreateEventMetric {
  Event_ID: number;
  Metric_ID: number;
  Numerical_Value: number;
  Domain_ID?: number;
  [key: string]: unknown;
}

interface Congregation {
  Congregation_ID: number;
  Congregation_Name: string;
}

// Create shared client and service instances
const mpClient = new MinistryPlatformClient();
const tableService = new TableService(mpClient);
const procedureService = new ProcedureService(mpClient);

/**
 * Get active congregations
 */
export async function getCongregations(): Promise<Congregation[]> {
  const today = new Date().toISOString().split('T')[0];

  return tableService.getTableRecords<Congregation>('Congregations', {
    $filter: `Start_Date <= '${today}' AND (End_Date IS NULL OR End_Date >= '${today}') AND Available_Online = 1`,
    $select: 'Congregation_ID, Congregation_Name',
    $orderby: 'Congregation_Name',
  });
}

/**
 * Get events for a specific date and optionally a specific congregation
 * @param congregationId - Optional congregation ID. If null, returns events for all congregations
 */
export async function getEvents(
  eventDate: string,
  congregationId: number | null
): Promise<Event[]> {
  // Base filter - adjust Event_Type_ID and Ministry_ID as needed per church
  let filter = `CAST(Events.Event_Start_Date AS DATE) = '${eventDate}'`;

  // Add congregation filter if provided
  if (congregationId) {
    filter += ` AND Events.Congregation_ID = ${congregationId}`;
  }

  return tableService.getTableRecords<Event>('Events', {
    $filter: filter,
    $select:
      'Events.Event_ID, Events.Event_Title, Events.Event_Start_Date, Events.Event_End_Date, Events.Congregation_ID, Events.Event_Type_ID, Events.Program_ID',
    $orderby: 'Event_Start_Date',
  });
}

/**
 * Get all available metrics
 */
export async function getMetrics(): Promise<Metric[]> {
  return tableService.getTableRecords<Metric>('Metrics', {
    $select: 'Metric_ID, Metric_Title',
    $orderby: 'Metric_Title',
  });
}

/**
 * Get existing metrics for an event
 */
export async function getEventMetrics(eventId: number): Promise<EventMetric[]> {
  return tableService.getTableRecords<EventMetric>('Event_Metrics', {
    $filter: `Event_ID = ${eventId}`,
    $select: 'Event_Metric_ID, Event_ID, Metric_ID, Numerical_Value, Group_ID',
    $orderby: 'Metric_ID',
  });
}

/**
 * Submit a new event metric
 */
export async function createEventMetric(
  data: CreateEventMetric,
  userId: number
): Promise<EventMetric> {
  const result = await tableService.createTableRecords<CreateEventMetric>(
    'Event_Metrics',
    [{ ...data, Domain_ID: 1 }],
    userId
  );
  return result[0] as unknown as EventMetric;
}

/**
 * Update an event metric
 */
export async function updateEventMetric(
  eventMetricId: number,
  data: Partial<CreateEventMetric>,
  userId: number
): Promise<void> {
  await tableService.updateTableRecords(
    'Event_Metrics',
    [{ Event_Metric_ID: eventMetricId, ...data }],
    userId
  );
}

/**
 * Delete an event metric
 */
export async function deleteEventMetric(eventMetricId: number, userId: number): Promise<void> {
  await tableService.deleteTableRecords('Event_Metrics', [eventMetricId], { $userId: userId });
}
