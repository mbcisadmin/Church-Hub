'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { DoorOpen, Loader2 } from 'lucide-react';
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

  const sortedRooms = (data?.rooms ?? [])
    .filter((r) => r.Room_ID !== null)
    .sort((a, b) => (a.Room_Name ?? '').localeCompare(b.Room_Name ?? ''));

  const participantsByRoom = new Map<number, EventParticipant[]>();
  for (const p of data?.participants ?? []) {
    if (p.Room_ID == null) continue;
    if (!participantsByRoom.has(p.Room_ID)) participantsByRoom.set(p.Room_ID, []);
    participantsByRoom.get(p.Room_ID)!.push(p);
  }

  const eventRoomsByRoom = new Map<number, EventRoom[]>();
  for (const er of data?.eventRooms ?? []) {
    if (!eventRoomsByRoom.has(er.Room_ID)) eventRoomsByRoom.set(er.Room_ID, []);
    eventRoomsByRoom.get(er.Room_ID)!.push(er);
  }

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
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {sortedRooms.map((room) => (
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
