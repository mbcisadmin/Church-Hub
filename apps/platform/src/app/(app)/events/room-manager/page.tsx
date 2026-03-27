'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { DoorOpen, Loader2, Search, X } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import RoomManagerHeader from './_components/RoomManagerHeader';
import RoomCard from './_components/RoomCard';
import RoomDetailSheet from './_components/RoomDetailSheet';
import MoveGroupSheet from './_components/MoveGroupSheet';
import { useRoomManagerData } from './_components/useRoomManagerData';
import type { EventParticipant, EventRoom, Room } from '@/types/roomManager';
import { useTrackPageVisit } from '@/lib/useTrackPageVisit';

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function RoomManagerPage() {
  return (
    <Suspense>
      <RoomManagerContent />
    </Suspense>
  );
}

function RoomManagerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    document.title = 'Room Manager | The Hub';
  }, []);

  useTrackPageVisit({
    resultType: 'app',
    resultId: 'room-manager',
    resultTitle: 'Room Manager',
    resultSubtitle: 'Events',
    resultRoute: '/events/room-manager',
    resultIcon: 'door-open',
  });

  // ---------------------------------------------------------------------------
  // URL-synced state
  // ---------------------------------------------------------------------------
  const selectedDate = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  const selectedEventId = searchParams.get('eventId')
    ? parseInt(searchParams.get('eventId')!, 10)
    : null;

  const pendingRef = useRef<Record<string, string | null> | null>(null);
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      pendingRef.current = { ...pendingRef.current, ...updates };

      queueMicrotask(() => {
        const pending = pendingRef.current;
        if (!pending) return;
        pendingRef.current = null;

        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(pending)) {
          if (value === null || value === '') {
            params.delete(key);
          } else {
            params.set(key, value);
          }
        }
        const qs = params.toString();
        router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
      });
    },
    [searchParams, router]
  );

  const setSelectedDate = useCallback(
    (date: string) => {
      updateParams({ date, eventId: null });
    },
    [updateParams]
  );

  const setSelectedEventId = useCallback(
    (eventId: number | null) => {
      updateParams({ eventId: eventId != null ? String(eventId) : null });
    },
    [updateParams]
  );

  // Data
  const { data, isLoading, error, executeAction } = useRoomManagerData(selectedEventId);
  const [roomSearch, setRoomSearch] = useState('');

  // Room detail sheet state
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomSheetOpen, setRoomSheetOpen] = useState(false);
  const [initialGroupER, setInitialGroupER] = useState<EventRoom | null>(null);

  // MoveGroupSheet state
  const [moveGroupEventRoom, setMoveGroupEventRoom] = useState<EventRoom | null>(null);
  const [moveGroupSheetOpen, setMoveGroupSheetOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleRoomClick = useCallback((room: Room) => {
    setSelectedRoom(room);
    setInitialGroupER(null);
    setRoomSheetOpen(true);
  }, []);

  const handleGroupClick = useCallback((room: Room, eventRoom: EventRoom) => {
    setSelectedRoom(room);
    setInitialGroupER(eventRoom);
    setRoomSheetOpen(true);
  }, []);

  const handleCloseRoomSheet = useCallback(() => {
    setRoomSheetOpen(false);
  }, []);

  const handleMoveGroup = useCallback((eventRoom: EventRoom) => {
    setMoveGroupEventRoom(eventRoom);
    setMoveGroupSheetOpen(true);
  }, []);

  const handleCloseAllInRoom = useCallback(
    (roomId: number) => {
      const room = data?.rooms.find((r) => r.Room_ID === roomId);
      const eventRoomIds = (data?.eventRooms ?? [])
        .filter((er) => er.Room_ID === roomId)
        .map((er) => er.Event_Room_ID);
      executeAction(
        { type: 'closeAll', roomId, eventRoomIds },
        `All groups in ${room?.Room_Name ?? 'room'} closed`
      );
    },
    [data, executeAction]
  );

  // ---------------------------------------------------------------------------
  // Derived data for room cards
  // ---------------------------------------------------------------------------

  const eventRoomsByRoom = new Map<number, EventRoom[]>();
  for (const er of data?.eventRooms ?? []) {
    if (!eventRoomsByRoom.has(er.Room_ID)) eventRoomsByRoom.set(er.Room_ID, []);
    eventRoomsByRoom.get(er.Room_ID)!.push(er);
  }

  // Check if a room is a volunteer room (room-level flag or all its event rooms are volunteer groups)
  const isVolunteerRoom = (r: Room) => {
    if (r.Volunteer_Group) return true;
    const ers = eventRoomsByRoom.get(r.Room_ID!) ?? [];
    return ers.length > 0 && ers.every((er) => er.Volunteer_Group);
  };

  const sortedRooms = (data?.rooms ?? [])
    .filter((r) => r.Room_ID !== null)
    .sort((a, b) => {
      const aVol = isVolunteerRoom(a);
      const bVol = isVolunteerRoom(b);
      if (aVol && !bVol) return -1;
      if (!aVol && bVol) return 1;
      return (a.Room_Name ?? '').localeCompare(b.Room_Name ?? '');
    });

  const participantsByRoom = new Map<number, EventParticipant[]>();
  for (const p of data?.participants ?? []) {
    if (p.Room_ID == null) continue;
    if (!participantsByRoom.has(p.Room_ID)) participantsByRoom.set(p.Room_ID, []);
    participantsByRoom.get(p.Room_ID)!.push(p);
  }

  // Group name lookup for search (same as RoomCard uses)
  const groupNameMap = new Map((data?.groups ?? []).map((g) => [g.Group_ID, g.Group_Name]));

  // Filter rooms by search query (room name, group names, participant names)
  const filteredRooms = roomSearch.trim()
    ? sortedRooms.filter((room) => {
        const q = roomSearch.toLowerCase();
        if (room.Room_Name.toLowerCase().includes(q)) return true;
        if (room.Building_Name?.toLowerCase().includes(q)) return true;
        const ers = eventRoomsByRoom.get(room.Room_ID!) ?? [];
        if (
          ers.some((er) => {
            const name = er.Group_Name || groupNameMap.get(er.Group_ID!) || '';
            return name.toLowerCase().includes(q);
          })
        )
          return true;
        const ps = participantsByRoom.get(room.Room_ID!) ?? [];
        if (ps.some((p) => p.Display_Name.toLowerCase().includes(q))) return true;
        return false;
      })
    : sortedRooms;

  const selectedRoomEventRooms = selectedRoom?.Room_ID
    ? (eventRoomsByRoom.get(selectedRoom.Room_ID) ?? [])
    : [];
  const selectedRoomParticipants = selectedRoom?.Room_ID
    ? (participantsByRoom.get(selectedRoom.Room_ID) ?? [])
    : [];

  return (
    <div>
      <div className="mx-auto max-w-[1600px]">
        <SectionHeader
          title="Room Manager"
          subtitle="Manage event room assignments and check-ins"
          icon={DoorOpen}
          variant="watermark"
          as="h1"
        />

        <div className="mx-auto max-w-6xl">
          <div className="space-y-8">
            <RoomManagerHeader
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedEventId={selectedEventId}
              onEventChange={setSelectedEventId}
              data={data}
            />

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
              </div>
            )}

            {error && <div className="text-destructive py-8 text-center text-sm">{error}</div>}

            {data && !isLoading && selectedEventId && sortedRooms.length > 0 && (
              <>
                <div className="relative mb-3">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="text-muted-foreground h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    placeholder="Search rooms, groups, or people..."
                    className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary h-10 w-full border pr-8 pl-9 text-sm focus:outline-none"
                  />
                  {roomSearch && (
                    <button
                      onClick={() => setRoomSearch('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      <X className="text-muted-foreground hover:text-foreground h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="text-muted-foreground mb-3 flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-[#3b82f6]" />
                    Leaders
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                    Attendees
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  {filteredRooms.map((room) => (
                    <RoomCard
                      key={room.Room_ID}
                      room={room}
                      eventRooms={eventRoomsByRoom.get(room.Room_ID!) ?? []}
                      participants={participantsByRoom.get(room.Room_ID!) ?? []}
                      groups={data?.groups ?? []}
                      highlighted={selectedRoom?.Room_ID === room.Room_ID && roomSheetOpen}
                      onClick={() => handleRoomClick(room)}
                      onCloseAll={() => handleCloseAllInRoom(room.Room_ID!)}
                      onAction={executeAction}
                      onMoveGroup={handleMoveGroup}
                      onGroupClick={(er) => handleGroupClick(room, er)}
                    />
                  ))}
                </div>
              </>
            )}

            {!selectedEventId && !isLoading && (
              <div className="text-muted-foreground py-12 text-center text-sm">
                Select a date and event to manage rooms
              </div>
            )}
          </div>
        </div>
      </div>

      <RoomDetailSheet
        open={roomSheetOpen}
        onClose={handleCloseRoomSheet}
        room={selectedRoom}
        eventRooms={selectedRoomEventRooms}
        participants={selectedRoomParticipants}
        groups={data?.groups ?? []}
        allRooms={data?.rooms ?? []}
        onAction={executeAction}
        initialGroupER={initialGroupER}
      />

      <MoveGroupSheet
        open={moveGroupSheetOpen}
        onClose={() => setMoveGroupSheetOpen(false)}
        eventRoom={moveGroupEventRoom}
        rooms={data?.rooms ?? []}
        eventRooms={data?.eventRooms ?? []}
        onAction={executeAction}
      />
    </div>
  );
}
