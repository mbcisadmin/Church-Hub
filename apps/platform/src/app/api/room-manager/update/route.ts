import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import {
  closeAllGroupsInRoom,
  updateEventRoom,
  updateEventParticipant,
  closeEventRooms,
  openEventRooms,
} from '@/services/roomManagerService';
import type { RoomManagerAction } from '@/types/roomManager';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.userId, 10);
    const action: RoomManagerAction = await request.json();

    switch (action.type) {
      case 'closeAll':
        await closeAllGroupsInRoom(action.eventRoomIds, userId);
        break;

      case 'toggleClosed':
        await updateEventRoom(action.eventRoomId, { Closed: action.closed }, userId);
        break;

      case 'toggleAutoClose':
        await updateEventRoom(
          action.eventRoomId,
          { Auto_Close_At_Capacity: action.autoClose },
          userId
        );
        break;

      case 'setCheckInCapacity':
        await updateEventRoom(action.eventRoomId, { Check_In_Capacity: action.capacity }, userId);
        break;

      case 'setBalancePriority':
        await updateEventRoom(action.eventRoomId, { Balance_Priority: action.priority }, userId);
        break;

      case 'checkOut':
        await updateEventParticipant(
          action.eventParticipantId,
          { Time_Out: new Date().toISOString() },
          userId
        );
        break;

      case 'checkIn':
        await updateEventParticipant(action.eventParticipantId, { Time_Out: null }, userId);
        break;

      case 'changeRoom':
        await updateEventParticipant(
          action.eventParticipantId,
          { Room_ID: action.newRoomId },
          userId
        );
        break;

      case 'closeRoom':
        await closeEventRooms(action.eventRoomIds, userId);
        break;

      case 'openRoom':
        await openEventRooms(action.eventRoomIds, userId);
        break;

      default:
        return NextResponse.json({ error: 'Unknown action type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      'Error executing room manager action:',
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      {
        error: 'Failed to execute action',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
