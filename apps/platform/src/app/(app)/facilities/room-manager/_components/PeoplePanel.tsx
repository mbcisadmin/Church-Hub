'use client';

import { format, parseISO } from 'date-fns';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Room, EventParticipant, RoomManagerAction } from '@/types/roomManager';

interface PeoplePanelProps {
  participants: EventParticipant[];
  rooms: Room[];
  roomName: string;
  onAction: (action: RoomManagerAction) => void;
}

export default function PeoplePanel({ participants, rooms, roomName, onAction }: PeoplePanelProps) {
  if (participants.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground text-sm">No people in {roomName}</p>
      </div>
    );
  }

  return (
    <div className="divide-border divide-y">
      {participants.map((p) => {
        const isCheckedIn = p.Time_In && !p.Time_Out;

        return (
          <div key={p.Event_Participant_ID} className="flex items-center gap-3 p-3">
            {/* Name + Time */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-foreground truncate text-sm font-medium">
                  {p.Display_Name}
                </span>
                {p._loading && <Loader2 className="text-primary h-3 w-3 shrink-0 animate-spin" />}
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                {p.Time_In && <span>In: {format(parseISO(p.Time_In), 'h:mm a')}</span>}
                {p.Time_Out && <span>Out: {format(parseISO(p.Time_Out), 'h:mm a')}</span>}
              </div>
            </div>

            {/* Room Change Dropdown */}
            <select
              value={p.Room_ID ?? ''}
              onChange={(e) => {
                const newRoomId = parseInt(e.target.value);
                if (newRoomId && newRoomId !== p.Room_ID) {
                  onAction({
                    type: 'changeRoom',
                    eventParticipantId: p.Event_Participant_ID,
                    newRoomId,
                  });
                }
              }}
              className="border-input bg-background text-foreground h-7 max-w-[120px] border px-1 text-xs focus:ring-2 focus:outline-none"
            >
              {rooms.map((r) => (
                <option key={r.Room_ID} value={r.Room_ID}>
                  {r.Room_Name}
                </option>
              ))}
            </select>

            {/* Check In / Check Out Toggle */}
            <Button
              size="sm"
              variant={isCheckedIn ? 'ghost' : 'outline'}
              onClick={() => {
                if (isCheckedIn) {
                  onAction({ type: 'checkOut', eventParticipantId: p.Event_Participant_ID });
                } else {
                  onAction({ type: 'checkIn', eventParticipantId: p.Event_Participant_ID });
                }
              }}
              className="h-7 w-7 rounded-none p-0"
              title={isCheckedIn ? 'Check out' : 'Check in'}
            >
              {isCheckedIn ? <LogOut className="h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
