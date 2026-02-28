'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { DoorOpen, Loader2 } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import RoomManagerHeader from './_components/RoomManagerHeader';
import FilterBar, { type FilterMode } from './_components/FilterBar';
import RoomCard from './_components/RoomCard';
import RoomDetailSheet from './_components/RoomDetailSheet';
import { useRoomManagerData } from './_components/useRoomManagerData';

export default function RoomManagerPage() {
  useEffect(() => {
    document.title = 'Room Manager | The Hub';
  }, []);

  // Selection state
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Filter state
  const [filterMode, setFilterMode] = useState<FilterMode>('room');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');

  // Sheet state
  const [roomDetailOpen, setRoomDetailOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // Data
  const { data, isLoading, error, executeAction } = useRoomManagerData(selectedEventId);

  // Compute which rooms to highlight based on filter
  const highlightedRoomIds = useMemo(() => {
    if (!data) return new Set<number>();

    if (filterMode === 'group' && selectedGroupId) {
      const roomIds = data.eventRooms
        .filter((er) => er.Group_ID === selectedGroupId)
        .map((er) => er.Room_ID);
      return new Set(roomIds);
    }

    if (filterMode === 'people' && searchText.trim()) {
      const query = searchText.toLowerCase();
      const roomIds = data.participants
        .filter((p) => p.Display_Name.toLowerCase().includes(query))
        .map((p) => p.Room_ID)
        .filter((id): id is number => id !== null);
      return new Set(roomIds);
    }

    return new Set<number>();
  }, [data, filterMode, selectedGroupId, searchText]);

  // Get rooms with their associated data
  const roomsWithData = useMemo(() => {
    if (!data) return [];

    return data.rooms.map((room) => ({
      room,
      eventRooms: data.eventRooms.filter((er) => er.Room_ID === room.Room_ID),
      participants: data.participants.filter((p) => p.Room_ID === room.Room_ID),
    }));
  }, [data]);

  // Selected room data for sheets
  const selectedRoom = data?.rooms.find((r) => r.Room_ID === selectedRoomId);
  const selectedRoomEventRooms =
    data?.eventRooms.filter((er) => er.Room_ID === selectedRoomId) ?? [];
  const selectedRoomParticipants =
    data?.participants.filter((p) => p.Room_ID === selectedRoomId) ?? [];

  const openRoomDetail = (roomId: number) => {
    setSelectedRoomId(roomId);
    setRoomDetailOpen(true);
  };

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
            {/* Header: Campus, Date, Event selection + Stats */}
            <RoomManagerHeader
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              selectedEventId={selectedEventId}
              onEventChange={setSelectedEventId}
              data={data}
            />

            {/* Filter Bar */}
            {data && selectedEventId && (
              <FilterBar
                mode={filterMode}
                onModeChange={(mode) => {
                  setFilterMode(mode);
                  setSelectedGroupId(null);
                  setSearchText('');
                }}
                groups={data.groups}
                participants={data.participants}
                selectedGroupId={selectedGroupId}
                onGroupSelect={setSelectedGroupId}
                searchText={searchText}
                onSearchChange={setSearchText}
              />
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && <div className="text-destructive py-8 text-center text-sm">{error}</div>}

            {/* Room Cards Grid */}
            {data && !isLoading && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {roomsWithData.map(({ room, eventRooms, participants }) => (
                  <RoomCard
                    key={room.Room_ID}
                    room={room}
                    eventRooms={eventRooms}
                    participants={participants}
                    highlighted={highlightedRoomIds.has(room.Room_ID)}
                    onClick={() => openRoomDetail(room.Room_ID)}
                    onCloseAll={() => {
                      const openIds = eventRooms
                        .filter((er) => !er.Closed)
                        .map((er) => er.Event_Room_ID);
                      if (openIds.length > 0) {
                        executeAction({
                          type: 'closeAll',
                          roomId: room.Room_ID,
                          eventRoomIds: openIds,
                        });
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {data && roomsWithData.length === 0 && !isLoading && (
              <div className="text-muted-foreground py-12 text-center text-sm">
                No rooms found for this event
              </div>
            )}

            {/* No event selected */}
            {!selectedEventId && !isLoading && (
              <div className="text-muted-foreground py-12 text-center text-sm">
                Select a date and event to manage rooms
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Room Detail Sheet */}
      <RoomDetailSheet
        open={roomDetailOpen}
        onClose={() => setRoomDetailOpen(false)}
        room={selectedRoom ?? null}
        eventRooms={selectedRoomEventRooms}
        participants={selectedRoomParticipants}
        allRooms={data?.rooms ?? []}
        onAction={executeAction}
      />
    </div>
  );
}
