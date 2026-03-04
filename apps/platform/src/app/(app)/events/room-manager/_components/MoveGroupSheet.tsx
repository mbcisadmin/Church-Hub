'use client';

import { DoorOpen, ArrowRightLeft } from 'lucide-react';
import { ResponsiveSheet, SheetPage } from '@church/nextjs-ui/components/ResponsiveSheet';
import type { Room, EventRoom, RoomManagerAction } from '@/types/roomManager';

interface MoveGroupSheetProps {
  open: boolean;
  onClose: () => void;
  eventRoom: EventRoom | null;
  rooms: Room[];
  eventRooms: EventRoom[];
  onAction: (action: RoomManagerAction, successMessage?: string) => void;
}

function MoveGroupHeader({ eventRoom }: { eventRoom: EventRoom }) {
  return (
    <div className="bg-primary relative overflow-hidden px-4 pt-4 pb-5 md:px-6 md:pt-6 md:pb-6">
      {/* Mobile drag handle */}
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>

      {/* Watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <ArrowRightLeft className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      <div className="relative z-10">
        <p className="text-sm text-white/70">Move group</p>
        <h2 className="mt-1 truncate text-xl font-bold tracking-wide text-white md:text-2xl">
          {eventRoom.Group_Name || `Group ${eventRoom.Group_ID}`}
        </h2>
        <p className="mt-1 text-sm text-white/70">
          Currently in {eventRoom.Room_Name} · {eventRoom.Checked_In} checked in
        </p>
      </div>
    </div>
  );
}

export default function MoveGroupSheet({
  open,
  onClose,
  eventRoom,
  rooms,
  eventRooms,
  onAction,
}: MoveGroupSheetProps) {
  if (!eventRoom) return null;

  // Available rooms: physical rooms that aren't the current one
  const availableRooms = rooms.filter((r) => r.Room_ID != null && r.Room_ID !== eventRoom.Room_ID);

  // Build a map of checked-in counts per room
  const checkedInByRoom = new Map<number, number>();
  for (const er of eventRooms) {
    checkedInByRoom.set(er.Room_ID, (checkedInByRoom.get(er.Room_ID) ?? 0) + er.Checked_In);
  }

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      panelClassName="bg-card overflow-hidden"
      maxWidth="max-w-lg"
      noPanelPadding
      header={<MoveGroupHeader eventRoom={eventRoom} />}
    >
      <SheetPage name="main">
        <div className="px-4 py-3 md:px-6">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Select destination room
          </p>
        </div>
        {availableRooms.length > 0 ? (
          <div className="divide-y">
            {availableRooms.map((room) => {
              const roomCheckedIn = checkedInByRoom.get(room.Room_ID!) ?? 0;
              const pct = room.Maximum_Capacity
                ? Math.min((roomCheckedIn / room.Maximum_Capacity) * 100, 100)
                : 0;
              const capacityColor =
                pct >= 90
                  ? 'text-red-600 dark:text-red-400'
                  : pct >= 75
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground';

              return (
                <button
                  key={room.Room_ID}
                  onClick={() => {
                    const groupLabel = eventRoom.Group_Name || `Group ${eventRoom.Group_ID}`;
                    onAction(
                      {
                        type: 'moveGroup',
                        eventRoomId: eventRoom.Event_Room_ID,
                        newRoomId: room.Room_ID!,
                      },
                      `${groupLabel} moved to ${room.Room_Name}`
                    );
                    onClose();
                  }}
                  className="hover:bg-muted flex w-full items-center justify-between px-4 py-3 text-left transition-all active:scale-[0.98] md:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-foreground truncate text-sm font-medium">
                      {room.Room_Name}
                    </span>
                    {room.Building_Name && (
                      <p className="text-muted-foreground text-xs">{room.Building_Name}</p>
                    )}
                  </div>
                  <div className="ml-2 shrink-0 text-right">
                    {room.Maximum_Capacity != null ? (
                      <span className={`text-xs font-medium ${capacityColor}`}>
                        {roomCheckedIn}/{room.Maximum_Capacity}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">{roomCheckedIn} in</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground px-4 py-6 text-center text-sm md:px-6">
            No other rooms available
          </p>
        )}
      </SheetPage>
    </ResponsiveSheet>
  );
}
