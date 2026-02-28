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

  return {
    event: events.length > 0 ? events[0] : null,
    rooms,
    eventRooms: eventRooms.map((er) => ({
      ...er,
      Closed: !!er.Closed,
      Auto_Close_At_Capacity: !!er.Auto_Close_At_Capacity,
    })),
    participants,
    groups,
  };
}

/**
 * Close all groups in a room (set Closed = true on multiple Event_Room records)
 */
export async function closeAllGroupsInRoom(eventRoomIds: number[], userId: number): Promise<void> {
  const updates = eventRoomIds.map((id) => ({
    Event_Room_ID: id,
    Closed: true,
  }));
  await tableService.updateTableRecords('Event_Rooms', updates, userId);
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
