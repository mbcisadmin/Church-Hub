'use client';

import { useState, useEffect } from 'react';
import { DoorOpen, Users, User } from 'lucide-react';
import { ResponsiveSheet, SheetPage } from '@church/nextjs-ui/components/ResponsiveSheet';
import GroupPanel from './GroupPanel';
import PeoplePanel from './PeoplePanel';
import type { Room, EventRoom, EventParticipant, RoomManagerAction } from '@/types/roomManager';

type PageName = 'groups' | 'people';

interface RoomDetailSheetProps {
  open: boolean;
  onClose: () => void;
  room: Room | null;
  eventRooms: EventRoom[];
  participants: EventParticipant[];
  allRooms: Room[];
  onAction: (action: RoomManagerAction) => void;
}

function RoomDetailHeader({
  room,
  eventRooms,
  participants,
  activePage,
  onNavigate,
}: {
  room: Room;
  eventRooms: EventRoom[];
  participants: EventParticipant[];
  activePage: PageName;
  onNavigate: (page: PageName) => void;
}) {
  const checkedIn = participants.filter((p) => p.Time_in && !p.Time_Out).length;

  const subtitle = [
    room.Building_Name,
    room.Maximum_Capacity != null && `Capacity: ${room.Maximum_Capacity}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="bg-primary relative overflow-hidden px-4 pt-4 pb-4 md:px-6 md:pt-6 md:pb-5">
      {/* Mobile drag handle */}
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>

      {/* DoorOpen watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <DoorOpen className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      {/* Title */}
      <div className="relative z-10">
        <h2 className="text-xl font-bold tracking-wide text-white md:text-2xl">{room.Room_Name}</h2>
        {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
      </div>

      {/* Pill buttons */}
      <div className="relative z-10 mt-4 flex gap-2">
        <button
          onClick={() => onNavigate('groups')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activePage === 'groups'
              ? 'text-primary bg-white'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Groups ({eventRooms.length})
        </button>
        <button
          onClick={() => onNavigate('people')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            activePage === 'people'
              ? 'text-primary bg-white'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          People ({checkedIn})
        </button>
      </div>
    </div>
  );
}

export default function RoomDetailSheet({
  open,
  onClose,
  room,
  eventRooms,
  participants,
  allRooms,
  onAction,
}: RoomDetailSheetProps) {
  const [activePage, setActivePage] = useState<PageName>('groups');

  // Reset to groups when opening a new room
  useEffect(() => {
    if (open) {
      setActivePage('groups');
    }
  }, [open, room?.Room_ID]);

  if (!room) return null;

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      panelClassName="bg-card overflow-hidden"
      maxWidth="max-w-2xl"
      noPanelPadding
      defaultPage={activePage}
      header={
        <RoomDetailHeader
          room={room}
          eventRooms={eventRooms}
          participants={participants}
          activePage={activePage}
          onNavigate={setActivePage}
        />
      }
    >
      <SheetPage name="groups">
        <GroupPanel eventRooms={eventRooms} roomName={room.Room_Name} onAction={onAction} />
      </SheetPage>
      <SheetPage name="people">
        <PeoplePanel
          participants={participants}
          rooms={allRooms}
          roomName={room.Room_Name}
          onAction={onAction}
        />
      </SheetPage>
    </ResponsiveSheet>
  );
}
