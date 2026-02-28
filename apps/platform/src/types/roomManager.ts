// Types for the Room Manager stored procedure (api_TheHub_Custom_EventRoomManager)
// SP returns 5 datasets at indices 0, 1, 3, 4, 5 (skipping 2)
// Field names TBD — will be confirmed against actual SP output

export interface RoomManagerEvent {
  Event_ID: number;
  Event_Title: string;
  Event_Start_Date: string;
  Event_End_Date: string;
  Congregation_ID: number;
}

export interface Room {
  Room_ID: number;
  Room_Name: string;
  Maximum_Capacity: number | null;
  Building_ID: number | null;
  Building_Name: string | null;
}

export interface EventRoom {
  Event_Room_ID: number;
  Event_ID: number;
  Room_ID: number;
  Room_Name: string;
  Group_ID: number | null;
  Group_Name: string | null;
  Closed: boolean;
  Auto_Close_At_Capacity: boolean;
  Check_In_Capacity: number | null;
  Balance_Priority: number | null;
  Checked_In: number;
  _loading?: boolean;
}

export interface EventParticipant {
  Event_Participant_ID: number;
  Event_ID: number;
  Participant_ID: number;
  Display_Name: string;
  Room_ID: number | null;
  Room_Name: string | null;
  Participant_Type_ID: number;
  Time_In: string | null;
  Time_Out: string | null;
  Group_Role_ID: number | null;
  _loading?: boolean;
}

export interface EventGroup {
  Group_ID: number;
  Group_Name: string;
}

export interface RoomManagerData {
  event: RoomManagerEvent | null;
  rooms: Room[];
  eventRooms: EventRoom[];
  participants: EventParticipant[];
  groups: EventGroup[];
}

// Discriminated union for all mutation actions
export type RoomManagerAction =
  | { type: 'closeAll'; roomId: number; eventRoomIds: number[] }
  | { type: 'toggleClosed'; eventRoomId: number; closed: boolean }
  | { type: 'toggleAutoClose'; eventRoomId: number; autoClose: boolean }
  | { type: 'setCheckInCapacity'; eventRoomId: number; capacity: number | null }
  | { type: 'setBalancePriority'; eventRoomId: number; priority: number | null }
  | { type: 'checkOut'; eventParticipantId: number }
  | { type: 'checkIn'; eventParticipantId: number }
  | { type: 'changeRoom'; eventParticipantId: number; newRoomId: number };
