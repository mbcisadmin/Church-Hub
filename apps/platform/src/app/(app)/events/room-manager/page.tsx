'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  DoorOpen,
  Loader2,
  LogOut,
  ArrowRightLeft,
  Search,
  Lock,
  User,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import RoomManagerHeader from './_components/RoomManagerHeader';
import PersonDetailSheet from './_components/PersonDetailSheet';
import { useRoomManagerData } from './_components/useRoomManagerData';
import type { EventParticipant, Room } from '@/types/roomManager';

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

function PersonAvatar({ person, size = 'sm' }: { person: EventParticipant; size?: 'sm' | 'md' }) {
  const [imgError, setImgError] = useState(false);
  const firstName = person.Nickname || person.First_Name;
  const initials =
    `${firstName?.charAt(0) ?? ''}${person.Last_Name?.charAt(0) ?? ''}`.toUpperCase();
  const showImage = person.Image_URL && !imgError;

  const sizeClass = size === 'md' ? 'h-12 w-12 text-base' : 'h-8 w-8 text-xs';

  if (showImage) {
    return (
      <img
        src={person.Image_URL!}
        alt={`${firstName} ${person.Last_Name}`}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  if (initials) {
    return (
      <div
        className={`bg-muted text-muted-foreground flex ${sizeClass} shrink-0 items-center justify-center rounded-full font-semibold`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`bg-muted text-muted-foreground flex ${sizeClass} shrink-0 items-center justify-center rounded-full`}
    >
      <User className={size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function personName(p: EventParticipant) {
  const first = p.Nickname || p.First_Name || '';
  return `${first} ${p.Last_Name ?? ''}`.trim();
}

/** MP returns datetimes as local server time with a Z suffix — strip it so JS treats as local */
function parseMpDate(dateStr: string): Date {
  return new Date(dateStr.replace(/Z$/i, ''));
}

// ---------------------------------------------------------------------------
// Person Card
// ---------------------------------------------------------------------------

function PersonCard({
  person,
  rooms,
  onCheckOut,
  onCheckIn,
  onChangeRoom,
  onPersonClick,
}: {
  person: EventParticipant;
  rooms: Room[];
  onCheckOut: (p: EventParticipant) => void;
  onCheckIn: (p: EventParticipant) => void;
  onChangeRoom: (p: EventParticipant, roomId: number) => void;
  onPersonClick: (p: EventParticipant) => void;
}) {
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const timeIn = person.Time_in ? parseMpDate(person.Time_in) : null;
  const formattedTime = timeIn ? format(timeIn, 'h:mm a') : '';
  const isCheckedOut = !!person.Time_Out;
  const timeOut = person.Time_Out ? parseMpDate(person.Time_Out) : null;
  const formattedTimeOut = timeOut ? format(timeOut, 'h:mm a') : '';

  const availableRooms = rooms.filter((r) => r.Room_ID !== null && r.Room_ID !== person.Room_ID);

  return (
    <div
      className={`flex cursor-pointer flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md ${isCheckedOut ? 'opacity-50' : ''}`}
      onClick={() => onPersonClick(person)}
    >
      {/* Card header — branded with avatar, name, age */}
      <div
        className={`relative flex flex-col items-center px-3 pt-4 pb-3 ${isCheckedOut ? 'bg-muted' : 'bg-primary'}`}
      >
        {/* NEW badge top-right */}
        {person.Is_New && (
          <span className="absolute top-2 right-2 rounded-full bg-green-400/20 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-green-200 uppercase">
            New
          </span>
        )}

        <PersonAvatar person={person} size="md" />
        <p
          className={`mt-2 w-full truncate text-center text-sm font-semibold ${isCheckedOut ? 'text-muted-foreground' : 'text-white'}`}
        >
          {personName(person)}
        </p>
        {person.Age != null && (
          <p className={`text-xs ${isCheckedOut ? 'text-muted-foreground/60' : 'text-white/60'}`}>
            Age {person.Age}
          </p>
        )}
      </div>

      {/* Session info */}
      <div className="bg-card space-y-1.5 px-3 py-2.5">
        {person.Role_Title && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{person.Role_Title}</span>
          </div>
        )}
        {formattedTime && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Clock className="h-3 w-3 shrink-0" />
            <span>In {formattedTime}</span>
            {isCheckedOut && formattedTimeOut && (
              <span className="text-muted-foreground/60">· Out {formattedTimeOut}</span>
            )}
          </div>
        )}
      </div>

      {/* Actions — always visible */}
      <div className="bg-card mt-auto border-t">
        {!isCheckedOut && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRoomPicker(!showRoomPicker);
            }}
            className="text-primary hover:bg-muted flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors"
          >
            <ArrowRightLeft className="h-3 w-3" />
            Move Room
          </button>
        )}
        {isCheckedOut ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCheckIn(person);
            }}
            className="text-primary hover:bg-muted flex w-full items-center justify-center gap-1.5 border-t py-2 text-xs font-medium transition-colors"
          >
            <CheckCircle2 className="h-3 w-3" />
            Check In
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCheckOut(person);
            }}
            className="text-destructive hover:bg-muted flex w-full items-center justify-center gap-1.5 border-t py-2 text-xs font-medium transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Check Out
          </button>
        )}
      </div>

      {/* Room picker dropdown */}
      {!isCheckedOut && showRoomPicker && availableRooms.length > 0 && (
        <div className="border-t">
          <div className="max-h-32 overflow-y-auto">
            {availableRooms.map((room) => (
              <button
                key={room.Room_ID}
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeRoom(person, room.Room_ID!);
                  setShowRoomPicker(false);
                }}
                className="hover:bg-muted flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors"
              >
                <span className="text-foreground truncate font-medium">{room.Room_Name}</span>
                {room.Maximum_Capacity != null && (
                  <span className="text-muted-foreground ml-2 shrink-0">
                    {room.Still_Checked_In ?? 0}/{room.Maximum_Capacity}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function RoomManagerPage() {
  useEffect(() => {
    document.title = 'Room Manager | The Hub';
  }, []);

  // Selection state
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Data
  const { data, isLoading, error, executeAction } = useRoomManagerData(selectedEventId);

  // Person detail sheet state
  const [selectedPerson, setSelectedPerson] = useState<EventParticipant | null>(null);
  const [personSheetOpen, setPersonSheetOpen] = useState(false);

  const handlePersonClick = (person: EventParticipant) => {
    setSelectedPerson(person);
    setPersonSheetOpen(true);
  };

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [showAll, setShowAll] = useState(true);

  const handleCheckOut = (person: EventParticipant) => {
    toast.success(`${personName(person)} checked out`);
    executeAction({ type: 'checkOut', eventParticipantId: person.Event_Participant_ID });
  };

  const handleCheckIn = (person: EventParticipant) => {
    toast.success(`${personName(person)} checked back in`);
    executeAction({ type: 'checkIn', eventParticipantId: person.Event_Participant_ID });
  };

  const handleChangeRoom = (person: EventParticipant, roomId: number) => {
    const targetRoom = data?.rooms.find((r) => r.Room_ID === roomId);
    toast.success(`${personName(person)} moved to ${targetRoom?.Room_Name ?? 'new room'}`);
    executeAction({
      type: 'changeRoom',
      eventParticipantId: person.Event_Participant_ID,
      newRoomId: roomId,
    });
  };

  const handleCloseRoom = (roomId: number) => {
    const room = data?.rooms.find((r) => r.Room_ID === roomId);
    toast.success(`${room?.Room_Name ?? 'Room'} closed`);
    executeAction({ type: 'closeRoom', roomId });
  };

  // Filter participants by search and checked-in status
  const filterPeople = (people: EventParticipant[]) => {
    let filtered = people;
    if (!showAll) {
      filtered = filtered.filter((p) => !p.Time_Out);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => personName(p).toLowerCase().includes(q));
    }
    return filtered;
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

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && <div className="text-destructive py-8 text-center text-sm">{error}</div>}

            {/* Room sections */}
            {data &&
              !isLoading &&
              (() => {
                const sortedRooms = [...(data.rooms ?? [])].sort((a, b) => {
                  if (a.Room_ID === null) return -1;
                  if (b.Room_ID === null) return 1;
                  return (a.Room_Name ?? '').localeCompare(b.Room_Name ?? '');
                });

                const participantsByRoom = new Map<number | null, EventParticipant[]>();
                for (const p of data.participants ?? []) {
                  const key = p.Room_ID ?? null;
                  if (!participantsByRoom.has(key)) participantsByRoom.set(key, []);
                  participantsByRoom.get(key)!.push(p);
                }

                return (
                  <div className="space-y-10">
                    {/* Search, Room filter & Show All toggle */}
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                          Search
                        </label>
                        <div className="relative">
                          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search people..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary h-10 w-full rounded-lg border pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="shrink-0">
                        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                          Room
                        </label>
                        <select
                          value={selectedRoomId}
                          onChange={(e) => setSelectedRoomId(e.target.value)}
                          className="border-input bg-background text-foreground focus:ring-primary h-10 rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
                        >
                          <option value="all">All Rooms</option>
                          {sortedRooms.map((room) => (
                            <option
                              key={room.Room_ID ?? 'unassigned'}
                              value={String(room.Room_ID ?? 'unassigned')}
                            >
                              {room.Room_ID === null ? 'No Room Assigned' : room.Room_Name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="shrink-0">
                        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                          Status
                        </label>
                        <button
                          onClick={() => setShowAll(!showAll)}
                          className="border-input bg-background relative flex h-10 w-[4.75rem] cursor-pointer items-center rounded-full border p-1"
                          aria-label={`Showing ${showAll ? 'all' : 'checked in'} people, click to toggle`}
                        >
                          <div
                            className="absolute h-8 w-8 rounded-full shadow-sm ring-1 ring-black/[0.06] transition-transform duration-200 ease-out"
                            style={{
                              transform: showAll ? 'translateX(calc(100% + 2px))' : 'translateX(0)',
                              background:
                                'linear-gradient(145deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.12) 100%)',
                              boxShadow:
                                '0 2px 6px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                            }}
                          />
                          <div
                            className={`relative z-10 flex h-8 w-8 items-center justify-center transition-colors duration-200 ${
                              !showAll ? 'text-foreground' : 'text-muted-foreground/50'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div
                            className={`relative z-10 flex h-8 w-8 items-center justify-center transition-colors duration-200 ${
                              showAll ? 'text-foreground' : 'text-muted-foreground/50'
                            }`}
                          >
                            <Users className="h-4 w-4" />
                          </div>
                        </button>
                      </div>
                    </div>

                    {sortedRooms
                      .filter((room) => {
                        if (selectedRoomId === 'all') return true;
                        const roomKey = String(room.Room_ID ?? 'unassigned');
                        return roomKey === selectedRoomId;
                      })
                      .map((room) => {
                        const allPeople = (participantsByRoom.get(room.Room_ID ?? null) ?? []).sort(
                          (a, b) => (a.Last_Name ?? '').localeCompare(b.Last_Name ?? '')
                        );
                        const people = filterPeople(allPeople);
                        const isUnassigned = room.Room_ID === null;
                        const checkedIn = room.Still_Checked_In ?? allPeople.length;

                        // Hide rooms with no matching people when searching
                        if (searchQuery.trim() && people.length === 0) return null;

                        const volunteers = allPeople.filter((p) => p.Group_Role_ID !== null).length;
                        const kids = allPeople.length - volunteers;
                        const ratioLabel = `(${volunteers}V : ${kids}K)`;

                        const capacityLabel =
                          !isUnassigned && room.Maximum_Capacity
                            ? `Capacity: ${checkedIn} / ${room.Maximum_Capacity} ${ratioLabel}`
                            : `${checkedIn} checked in ${ratioLabel}`;

                        return (
                          <div key={room.Room_ID ?? 'unassigned'}>
                            <SectionTitle
                              icon={isUnassigned ? AlertTriangle : DoorOpen}
                              title={isUnassigned ? 'No Room Assigned' : room.Room_Name}
                              subtitle={capacityLabel}
                              action={!isUnassigned && room.Room_ID != null ? 'Close' : undefined}
                              onAction={
                                !isUnassigned && room.Room_ID != null
                                  ? () => handleCloseRoom(room.Room_ID!)
                                  : undefined
                              }
                            />

                            {/* People grid */}
                            {people.length > 0 ? (
                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {people.map((person) => (
                                  <PersonCard
                                    key={person.Event_Participant_ID}
                                    person={person}
                                    rooms={data.rooms}
                                    onCheckOut={handleCheckOut}
                                    onCheckIn={handleCheckIn}
                                    onChangeRoom={handleChangeRoom}
                                    onPersonClick={handlePersonClick}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="text-muted-foreground py-4 text-center text-xs">
                                No one checked in
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                );
              })()}

            {/* No event selected */}
            {!selectedEventId && !isLoading && (
              <div className="text-muted-foreground py-12 text-center text-sm">
                Select a date and event to manage rooms
              </div>
            )}
          </div>
        </div>
      </div>

      <PersonDetailSheet
        open={personSheetOpen}
        onClose={() => setPersonSheetOpen(false)}
        person={selectedPerson}
        roomName={selectedPerson?.Room_Name ?? null}
        rooms={data?.rooms ?? []}
        onCheckOut={handleCheckOut}
        onCheckIn={handleCheckIn}
        onChangeRoom={handleChangeRoom}
      />
    </div>
  );
}
