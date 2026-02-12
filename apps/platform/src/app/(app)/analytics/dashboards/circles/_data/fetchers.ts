import { MinistryPlatformClient, ProcedureService } from '@church/ministry-platform';
import type {
  FilterConfig,
  MilestoneSection,
  CircleName,
  OverTimeData,
  ParticipantRow,
  FiscalPeriod,
} from './types';
import {
  mockFetchFilters,
  mockFetchParticipants,
  mockFetchMilestones,
  mockFetchFiscalPeriods,
  mockFetchOverTimeData,
} from './mock-data';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true';

const mpClient = new MinistryPlatformClient();
const procedureService = new ProcedureService(mpClient);

const CIRCLE_NAME_MAP: Record<string, CircleName> = {
  'Joined Community': 'community',
  'Joined Crowd': 'crowd',
  'Joined Congregation': 'congregation',
  'Joined Committed': 'committed',
  'Joined Core': 'core',
};

const CIRCLE_ORDER: CircleName[] = ['community', 'crowd', 'congregation', 'committed', 'core'];

const CIRCLE_TITLES: Record<CircleName, string> = {
  community: 'Community',
  crowd: 'Crowd',
  congregation: 'Congregation',
  committed: 'Committed',
  core: 'Core',
};

const CIRCLE_TOOLTIPS: Record<CircleName, string> = {
  community: 'The outermost circle - people with some connection to the church',
  crowd: 'People who attend services and events',
  congregation: 'Regular attenders who are connected and growing',
  committed: 'Active members who serve, give, and participate in groups',
  core: 'Leaders and deeply committed members who multiply ministry',
};

const PARTICIPANT_FIELDS = [
  'Circle',
  'Engagement_Level',
  'Congregation_Name',
  'Participant_Type',
  'Household_Position',
  'Marital_Status',
  'Gender',
] as const;

export async function fetchFilters(): Promise<FilterConfig[]> {
  if (USE_MOCK) return mockFetchFilters();

  const results = await procedureService.executeProcedureWithBody(
    'api_TheHub_Custom_CircleFilters',
    { '@DomainID': 1, '@UserName': '' }
  );

  const [
    ,
    engagement,
    congregations,
    participantTypes,
    householdPositions,
    maritalStatuses,
    genders,
  ] = results as Record<string, unknown>[][];

  return [
    {
      key: 'engagement',
      label: 'Engagement',
      defaultLabel: 'All Engagement',
      pluralLabel: 'Levels',
      options: engagement.map((r) => ({
        value: String(r.Participant_Engagement_ID),
        label: String(r.Engagement_Level),
      })),
    },
    {
      key: 'campus',
      label: 'Campus',
      defaultLabel: 'All Campuses',
      pluralLabel: 'Campuses',
      options: congregations.map((r) => ({
        value: String(r.Congregation_ID),
        label: String(r.Congregation_Name),
      })),
    },
    {
      key: 'participantType',
      label: 'Participant Type',
      defaultLabel: 'All Types',
      pluralLabel: 'Types',
      options: participantTypes.map((r) => ({
        value: String(r.Participant_Type_ID),
        label: String(r.Participant_Type),
      })),
    },
    {
      key: 'householdPosition',
      label: 'Household Position',
      defaultLabel: 'All Positions',
      pluralLabel: 'Positions',
      options: householdPositions.map((r) => ({
        value: String(r.Household_Position_ID),
        label: String(r.Household_Position),
      })),
    },
    {
      key: 'maritalStatus',
      label: 'Marital Status',
      defaultLabel: 'All Statuses',
      pluralLabel: 'Statuses',
      options: maritalStatuses.map((r) => ({
        value: String(r.Marital_Status_ID),
        label: String(r.Marital_Status),
      })),
    },
    {
      key: 'gender',
      label: 'Gender',
      defaultLabel: 'All Genders',
      pluralLabel: 'Genders',
      options: genders.map((r) => ({
        value: String(r.Gender_ID),
        label: String(r.Gender),
      })),
    },
  ];
}

export async function fetchParticipants(): Promise<ParticipantRow[]> {
  if (USE_MOCK) return mockFetchParticipants();

  const results = await procedureService.executeProcedureWithBody(
    'api_TheHub_Custom_CircleParticipants',
    { '@DomainID': 1, '@UserName': '' }
  );

  const rows = results[0] as Record<string, unknown>[];

  return rows.map((row) => {
    const slim = {} as Record<string, string | null>;
    for (const field of PARTICIPANT_FIELDS) {
      const val = row[field];
      slim[field] = val == null ? null : String(val);
    }
    return slim as unknown as ParticipantRow;
  });
}

export async function fetchMilestones(): Promise<MilestoneSection[]> {
  if (USE_MOCK) return mockFetchMilestones();

  const results = await procedureService.executeProcedureWithBody(
    'api_TheHub_Custom_CircleConfiguration',
    { '@DomainID': 1, '@UserName': '' }
  );

  const rows = results[0] as Record<string, unknown>[];

  const grouped = new Map<CircleName, MilestoneSection>();

  for (const row of rows) {
    const circle = CIRCLE_NAME_MAP[String(row.Justifies_Adding)];
    if (!circle) continue;

    if (!grouped.has(circle)) {
      grouped.set(circle, {
        circle,
        title: CIRCLE_TITLES[circle],
        tooltip: CIRCLE_TOOLTIPS[circle],
        milestones: [],
      });
    }

    const totalAssigned = Number(row.Instances_Assigned);
    const changedCircle = Number(row.Changed_Circle);

    grouped.get(circle)!.milestones.push({
      name: String(row.Milestone_Title),
      totalAssigned: totalAssigned.toLocaleString(),
      firstInCircle: `+ ${changedCircle.toLocaleString()}`,
      description: row.Description ? String(row.Description) : '',
      mpUrl: String(row.MP_URL),
    });
  }

  return CIRCLE_ORDER.filter((c) => grouped.has(c)).map((c) => grouped.get(c)!);
}

/**
 * Fetch available fiscal periods for the dropdown.
 * Calls the proc without @AsOfFiscalPeriodID to get all available periods.
 */
export async function fetchFiscalPeriods(): Promise<FiscalPeriod[]> {
  if (USE_MOCK) return mockFetchFiscalPeriods();

  const results = await procedureService.executeProcedureWithBody(
    'api_TheHub_Custom_CirclesOverTime',
    { '@DomainID': 1, '@UserName': '' }
  );

  const rows = results[0] as Record<string, unknown>[];

  return rows.map((r) => {
    const date = new Date(String(r.Fiscal_Period_Start));
    return {
      id: Number(r.Fiscal_Period_ID),
      name: String(r.Fiscal_Period_Name),
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  });
}

/**
 * Fetch over-time data for a specific fiscal period.
 * Passes @AsOfFiscalPeriodID to get accurate historical snapshots.
 */
export async function fetchOverTimeData(asOfFiscalPeriodId?: number): Promise<OverTimeData> {
  if (USE_MOCK) return mockFetchOverTimeData(asOfFiscalPeriodId);

  // Build params - include @AsOfFiscalPeriodID if provided
  const baseParams = { '@DomainID': 1, '@UserName': '' };
  const overTimeParams = asOfFiscalPeriodId
    ? { ...baseParams, '@AsOfFiscalPeriodID': asOfFiscalPeriodId }
    : baseParams;
  const movementParams = asOfFiscalPeriodId
    ? { ...baseParams, '@AsOfFiscalPeriodID': asOfFiscalPeriodId }
    : baseParams;

  const [overTimeResults, movementResults, filtersResults] = await Promise.all([
    procedureService.executeProcedureWithBody('api_TheHub_Custom_CirclesOverTime', overTimeParams),
    procedureService.executeProcedureWithBody('api_TheHub_Custom_CircleMovement', movementParams),
    procedureService.executeProcedureWithBody('api_TheHub_Custom_CircleFilters', baseParams),
  ]);

  const allOverTimeRows = (overTimeResults[0] as Record<string, unknown>[]) ?? [];
  const allMovementRows = (movementResults[0] as Record<string, unknown>[]) ?? [];
  const allFiscalPeriodRows = (filtersResults[0] as Record<string, unknown>[]) ?? [];

  // Validate that we have data with expected columns
  if (allOverTimeRows.length === 0) {
    throw new Error('CirclesOverTime stored procedure returned no data');
  }
  if (allMovementRows.length === 0) {
    throw new Error('CircleMovement stored procedure returned no data');
  }

  // Check for expected columns in the first row
  const sampleOverTimeRow = allOverTimeRows[0];
  const requiredOverTimeColumns = [
    'Reached_Community',
    'Reached_Crowd',
    'Reached_Congregation',
    'Reached_Committed',
    'Reached_Core',
    'Fiscal_Period_Name',
  ];
  const missingOverTimeColumns = requiredOverTimeColumns.filter(
    (col) => !(col in sampleOverTimeRow)
  );
  if (missingOverTimeColumns.length > 0) {
    throw new Error(
      `CirclesOverTime data missing required columns: ${missingOverTimeColumns.join(', ')}`
    );
  }

  const sampleMovementRow = allMovementRows[0];
  const requiredMovementColumns = [
    'Joined_Community',
    'Joined_Crowd',
    'Joined_Congregation',
    'Joined_Committed',
    'Joined_Core',
    'Fiscal_Period_Name',
  ];
  const missingMovementColumns = requiredMovementColumns.filter(
    (col) => !(col in sampleMovementRow)
  );
  if (missingMovementColumns.length > 0) {
    throw new Error(
      `CircleMovement data missing required columns: ${missingMovementColumns.join(', ')}`
    );
  }

  // Index movement rows by fiscal period for fast lookup
  const movementByPeriod = new Map<string, Record<string, unknown>>();
  for (const row of allMovementRows) {
    movementByPeriod.set(String(row.Fiscal_Period_Name), row);
  }

  // Only include months present in both datasets
  const overTimeRows = allOverTimeRows.filter((r) =>
    movementByPeriod.has(String(r.Fiscal_Period_Name))
  );
  const movementRows = overTimeRows.map((r) => movementByPeriod.get(String(r.Fiscal_Period_Name))!);

  // Ensure we have matching data after filtering
  if (overTimeRows.length === 0) {
    throw new Error(
      'No matching fiscal periods found between CirclesOverTime and CircleMovement data'
    );
  }

  // Build fiscal periods list from the filters proc (first dataset)
  const fiscalPeriods: FiscalPeriod[] = allFiscalPeriodRows.map((r) => {
    const date = new Date(String(r.Fiscal_Period_Start));
    return {
      id: Number(r.Fiscal_Period_ID),
      name: String(r.Fiscal_Period_Name),
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  });

  // Ensure all periods from the data are included in the dropdown (filters proc may exclude recent periods)
  const fiscalPeriodIds = new Set(fiscalPeriods.map((p) => p.id));
  for (const row of allOverTimeRows) {
    const id = Number(row.Fiscal_Period_ID);
    if (!fiscalPeriodIds.has(id)) {
      const date = new Date(String(row.Fiscal_Period_Start));
      fiscalPeriods.push({
        id,
        name: String(row.Fiscal_Period_Name),
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      });
      fiscalPeriodIds.add(id);
    }
  }

  const labels = overTimeRows.map((r) => {
    const name = String(r.Fiscal_Period_Name);
    const parts = name.split(' ');
    return parts[parts.length - 1];
  });

  const fullLabels = overTimeRows.map((r) => {
    const date = new Date(String(r.Fiscal_Period_Start));
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  const inCircle: Record<CircleName, number[]> = {
    community: overTimeRows.map((r) => Number(r.Reached_Community)),
    crowd: overTimeRows.map((r) => Number(r.Reached_Crowd)),
    congregation: overTimeRows.map((r) => Number(r.Reached_Congregation)),
    committed: overTimeRows.map((r) => Number(r.Reached_Committed)),
    core: overTimeRows.map((r) => Number(r.Reached_Core)),
  };

  const movement: Record<CircleName, number[]> = {
    community: movementRows.map((r) => Number(r.Joined_Community)),
    crowd: movementRows.map((r) => Number(r.Joined_Crowd)),
    congregation: movementRows.map((r) => Number(r.Joined_Congregation)),
    committed: movementRows.map((r) => Number(r.Joined_Committed)),
    core: movementRows.map((r) => Number(r.Joined_Core)),
  };

  const latest = overTimeRows[overTimeRows.length - 1];
  const first = overTimeRows[0];

  function reachedTotal(row: Record<string, unknown>) {
    return (
      Number(row.Reached_Community) +
      Number(row.Reached_Crowd) +
      Number(row.Reached_Congregation) +
      Number(row.Reached_Committed) +
      Number(row.Reached_Core)
    );
  }

  const latestMovement = movementRows[movementRows.length - 1];

  function joinedTotal(row: Record<string, unknown>) {
    return (
      Number(row.Joined_Community) +
      Number(row.Joined_Crowd) +
      Number(row.Joined_Congregation) +
      Number(row.Joined_Committed) +
      Number(row.Joined_Core)
    );
  }

  const latestTotal = reachedTotal(latest);
  const firstTotal = reachedTotal(first);
  const overallChange = firstTotal > 0 ? ((latestTotal - firstTotal) / firstTotal) * 100 : 0;
  const totalNew = joinedTotal(latestMovement);

  const circleKeys: CircleName[] = ['community', 'crowd', 'congregation', 'committed', 'core'];
  const reachedFields = [
    'Reached_Community',
    'Reached_Crowd',
    'Reached_Congregation',
    'Reached_Committed',
    'Reached_Core',
  ];
  const joinedFields = [
    'Joined_Community',
    'Joined_Crowd',
    'Joined_Congregation',
    'Joined_Committed',
    'Joined_Core',
  ];

  const circleStats = {} as Record<CircleName, { total: string; newCount: string; change: string }>;
  for (let i = 0; i < circleKeys.length; i++) {
    const latestVal = Number(latest[reachedFields[i]]);
    const firstVal = Number(first[reachedFields[i]]);
    const change = firstVal > 0 ? ((latestVal - firstVal) / firstVal) * 100 : 0;
    const newVal = Number(latestMovement[joinedFields[i]]);
    circleStats[circleKeys[i]] = {
      total: latestVal.toLocaleString(),
      newCount: newVal.toLocaleString(),
      change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
    };
  }

  const latestPeriodStart = String(latest.Fiscal_Period_Start);
  const asOfDate = new Date(latestPeriodStart);
  const asOf = asOfDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Determine selected period ID (last row's ID, or the passed-in ID)
  const selectedPeriodId = Number(latest.Fiscal_Period_ID);

  return {
    asOf,
    labels,
    fullLabels,
    overviewStats: {
      total: latestTotal.toLocaleString(),
      newCount: totalNew.toLocaleString(),
      change: `${overallChange >= 0 ? '+' : ''}${overallChange.toFixed(1)}%`,
    },
    circleStats,
    inCircle,
    movement,
    fiscalPeriods,
    selectedPeriodId,
  };
}
