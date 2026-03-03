import { MinistryPlatformClient, TableService, ProcedureService } from '@church/ministry-platform';
import type {
  RoomManagerData,
  RoomManagerEvent,
  Room,
  EventRoom,
  EventParticipant,
  EventGroup,
} from '@/types/roomManager';

// Shared client and service instances
const mpClient = new MinistryPlatformClient();
const tableService = new TableService(mpClient);
const procedureService = new ProcedureService(mpClient);

/**
 * Execute the Room Manager stored procedure and return typed data
 */
export async function getRoomManagerData(eventId: number): Promise<RoomManagerData> {
  const result = (await procedureService.executeProcedure('api_TheHub_Custom_EventRoomManager', {
    '@DomainID': 1,
    '@EventID': eventId,
  })) as unknown[][];

  // SP returns datasets at indices 0, 1, 3, 4, 5 (skipping 2)
  // Map to typed arrays — field names may need adjustment after testing
  const events = (result[0] || []) as RoomManagerEvent[];
  const rooms = (result[1] || []) as Room[];
  const eventRooms = (result[2] || []) as EventRoom[];
  const participants = (result[3] || []) as EventParticipant[];
  const groups = (result[4] || []) as EventGroup[];

  // Enrich participants with additional data from MP tables
  const fileBaseUrl = process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL;
  const imageMap = new Map<number, string>();
  const genderMap = new Map<number, string>();
  const groupInfoMap = new Map<
    number,
    { Group_Name: string | null; Group_Role_Title: string | null; Group_Role_Type: string | null }
  >();

  if (participants.length > 0) {
    const participantIds = participants.map((p) => p.Participant_ID).filter((id) => id != null);
    const eventParticipantIds = participants
      .map((p) => p.Event_Participant_ID)
      .filter((id) => id != null);

    const BATCH_SIZE = 25;

    // Fetch contacts (images + gender) in batches
    for (let i = 0; i < participantIds.length; i += BATCH_SIZE) {
      const batch = participantIds.slice(i, i + BATCH_SIZE);
      try {
        const filter = batch.map((id) => `Participant_Record=${id}`).join(' OR ');
        const contacts = await tableService.getTableRecords<Record<string, unknown>>('Contacts', {
          $select: 'Participant_Record,dp_fileUniqueId,Gender_ID_Table.Gender',
          $filter: filter,
        });

        for (const c of contacts) {
          const pid = c.Participant_Record as number;
          if (!pid) continue;

          // Image GUID
          if (fileBaseUrl) {
            const guid = Object.entries(c).find(
              ([key, val]) =>
                key !== 'Participant_Record' &&
                key !== 'Gender' &&
                typeof val === 'string' &&
                val.length > 0
            )?.[1] as string | undefined;
            if (guid) {
              imageMap.set(pid, `${fileBaseUrl}/${guid}?$thumbnail=true`);
            }
          }

          // Gender
          if (c.Gender && typeof c.Gender === 'string') {
            genderMap.set(pid, c.Gender);
          }
        }
      } catch (err) {
        console.error('[RoomManager] Error fetching contacts (batch):', err);
        break;
      }
    }

    // Fetch group info from Event_Participants table in batches
    for (let i = 0; i < eventParticipantIds.length; i += BATCH_SIZE) {
      const batch = eventParticipantIds.slice(i, i + BATCH_SIZE);
      try {
        const filter = batch.map((id) => `Event_Participant_ID=${id}`).join(' OR ');
        const epRecords = await tableService.getTableRecords<Record<string, unknown>>(
          'Event_Participants',
          {
            $select:
              'Event_Participant_ID,Group_Participant_ID_Table_Group_ID_Table.Group_Name,Group_Role_ID_Table.Role_Title,Group_Role_ID_Table_Group_Role_Type_ID_Table.Group_Role_Type',
            $filter: filter,
          }
        );

        for (const ep of epRecords) {
          const epId = ep.Event_Participant_ID as number;
          if (!epId) continue;
          groupInfoMap.set(epId, {
            Group_Name: (ep.Group_Name as string) ?? null,
            Group_Role_Title: (ep.Role_Title as string) ?? null,
            Group_Role_Type: (ep.Group_Role_Type as string) ?? null,
          });
        }
      } catch (err) {
        console.error('[RoomManager] Error fetching group info (batch):', err);
        break;
      }
    }
  }

  // Attach enriched data to participants
  const enrichedParticipants = participants.map((p) => {
    const groupInfo = groupInfoMap.get(p.Event_Participant_ID);
    return {
      ...p,
      Image_URL: imageMap.get(p.Participant_ID) ?? null,
      Gender: genderMap.get(p.Participant_ID) ?? null,
      Group_Name: groupInfo?.Group_Name ?? null,
      Group_Role_Title: groupInfo?.Group_Role_Title ?? null,
      Group_Role_Type: groupInfo?.Group_Role_Type ?? null,
    };
  });

  return {
    event: events.length > 0 ? events[0] : null,
    rooms,
    eventRooms: eventRooms.map((er) => ({
      ...er,
      Closed: !!er.Closed,
      Auto_Close_At_Capacity: !!er.Auto_Close_At_Capacity,
    })),
    participants: enrichedParticipants,
    groups,
  };
}

/**
 * Close all groups in a room (set Closed = true on multiple Event_Room records)
 */
export async function closeAllGroupsInRoom(eventRoomIds: number[], userId: number): Promise<void> {
  if (eventRoomIds.length === 0) return;
  const updates = eventRoomIds.map((id) => ({
    Event_Room_ID: id,
    Closed: true,
  }));
  await tableService.updateTableRecords('Event_Rooms', updates, userId);
}

/**
 * Close specific Event_Room records sequentially
 */
export async function closeEventRooms(eventRoomIds: number[], userId: number): Promise<void> {
  if (eventRoomIds.length === 0) return;
  for (const id of eventRoomIds) {
    await tableService.updateTableRecords(
      'Event_Rooms',
      [{ Event_Room_ID: id, Closed: true }],
      userId
    );
  }
}

/**
 * Open specific Event_Room records sequentially
 */
export async function openEventRooms(eventRoomIds: number[], userId: number): Promise<void> {
  if (eventRoomIds.length === 0) return;
  for (const id of eventRoomIds) {
    await tableService.updateTableRecords(
      'Event_Rooms',
      [{ Event_Room_ID: id, Closed: false }],
      userId
    );
  }
}

/**
 * Update a single Event_Room record
 */
export async function updateEventRoom(
  eventRoomId: number,
  data: Partial<{
    Closed: boolean;
    Auto_Close_At_Capacity: boolean;
    Check_In_Capacity: number | null;
    Balance_Priority: number | null;
  }>,
  userId: number
): Promise<void> {
  await tableService.updateTableRecords(
    'Event_Rooms',
    [{ Event_Room_ID: eventRoomId, ...data }],
    userId
  );
}

/**
 * Update a single Event_Participant record (check in/out, room change)
 */
export async function updateEventParticipant(
  eventParticipantId: number,
  data: Partial<{
    Time_In: string | null;
    Time_Out: string | null;
    Room_ID: number | null;
  }>,
  userId: number
): Promise<void> {
  await tableService.updateTableRecords(
    'Event_Participants',
    [{ Event_Participant_ID: eventParticipantId, ...data }],
    userId
  );
}
