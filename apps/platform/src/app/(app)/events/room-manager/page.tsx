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
  Sparkles,
  RotateCcw,
  MapPin,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { Button } from '@/components/ui/button';
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

/** Priority-based "new" badge resolver — returns the first truthy status */
function getNewBadge(
  p: EventParticipant
): { label: string; colorClasses: string; Icon: LucideIcon } | null {
  if (p.Is_New)
    return { label: 'New', colorClasses: 'bg-green-400/20 text-green-200', Icon: Sparkles };
  if (p.Is_New_Again)
    return { label: 'Returning', colorClasses: 'bg-blue-400/20 text-blue-200', Icon: RotateCcw };
  if (p.Is_New_to_Congregation)
    return {
      label: 'New to Campus',
      colorClasses: 'bg-purple-400/20 text-purple-200',
      Icon: MapPin,
    };
  if (p.Is_New_to_Program)
    return {
      label: 'New to Program',
      colorClasses: 'bg-amber-400/20 text-amber-200',
      Icon: BookOpen,
    };
  return null;
}

function isVolunteer(p: EventParticipant): boolean {
  return p.Group_Role_Type_ID === 1 || p.Group_Role_Type_ID === 3;
}

// ---------------------------------------------------------------------------
// Person Card
// ---------------------------------------------------------------------------

function PersonCard({
  person,
  onCheckOut,
  onCheckIn,
  onMoveRoom,
  onPersonClick,
}: {
  person: EventParticipant;
  onCheckOut: (p: EventParticipant) => void;
  onCheckIn: (p: EventParticipant) => void;
  onMoveRoom: (p: EventParticipant) => void;
  onPersonClick: (p: EventParticipant) => void;
}) {
  const timeIn = person.Time_in ? parseMpDate(person.Time_in) : null;
  const formattedTime = timeIn ? format(timeIn, 'h:mm a') : '';
  const isCheckedOut = !!person.Time_Out;
  const timeOut = person.Time_Out ? parseMpDate(person.Time_Out) : null;
  const formattedTimeOut = timeOut ? format(timeOut, 'h:mm a') : '';
  const isLoading = person._loading;
  const badge = getNewBadge(person);
  const headerBg = isCheckedOut
    ? 'bg-muted'
    : isVolunteer(person)
      ? 'bg-neutral-700'
      : 'bg-primary';

  return (
    <div
      className={`flex cursor-pointer flex-col overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-md ${isCheckedOut ? 'opacity-50' : ''} ${isLoading ? 'ring-primary/40 scale-[0.97] ring-2' : ''}`}
      onClick={() => onPersonClick(person)}
    >
      {/* Card header — branded with avatar, name, age */}
      <div className={`flex flex-col items-center px-3 pt-2 pb-5 ${headerBg}`}>
        {/* Status badge row — always reserved for consistent card height */}
        <div className="mb-1.5 flex h-[14px] w-full justify-end">
          {badge && (
            <span
              className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold uppercase ${badge.colorClasses}`}
            >
              <badge.Icon className="h-2.5 w-2.5" />
              {badge.label}
            </span>
          )}
        </div>

        <PersonAvatar person={person} size="md" />
        <p
          className={`mt-2 w-full truncate text-center text-sm font-semibold ${isCheckedOut ? 'text-muted-foreground' : 'text-white'}`}
        >
          {personName(person)}
        </p>
        {(person.Age != null || person.Gender) && (
          <p className={`text-xs ${isCheckedOut ? 'text-muted-foreground/60' : 'text-white/60'}`}>
            {[person.Age != null ? `Age ${person.Age}` : null, person.Gender]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </div>

      {/* Session info */}
      <div className="bg-card space-y-1.5 px-3 py-2.5">
        {person.Group_Role_Title && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{person.Group_Role_Title}</span>
          </div>
        )}
        {person.Group_Role_Type && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Users className="h-3 w-3 shrink-0" />
            <span className="truncate">{person.Group_Role_Type}</span>
          </div>
        )}
        {formattedTime && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Clock className="h-3 w-3 shrink-0" />
            <span>
              In {formattedTime}
              {isCheckedOut && formattedTimeOut && (
                <span className="text-muted-foreground/60"> · Out {formattedTimeOut}</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Actions — always visible */}
      <div className="bg-card mt-auto border-t">
        {!isCheckedOut && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveRoom(person);
            }}
            className="text-primary hover:bg-muted flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all active:scale-95"
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
            className="text-primary hover:bg-muted flex w-full items-center justify-center gap-1.5 border-t py-2 text-xs font-medium transition-all active:scale-95"
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
            className="text-destructive hover:bg-muted flex w-full items-center justify-center gap-1.5 border-t py-2 text-xs font-medium transition-all active:scale-95"
          >
            <LogOut className="h-3 w-3" />
            Check Out
          </button>
        )}
      </div>
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
  const [sheetDefaultPage, setSheetDefaultPage] = useState('main');

  const handlePersonClick = (person: EventParticipant) => {
    setSelectedPerson(person);
    setSheetDefaultPage('main');
    setPersonSheetOpen(true);
  };

  const handleMoveRoom = (person: EventParticipant) => {
    setSelectedPerson(person);
    setSheetDefaultPage('move-room');
    setPersonSheetOpen(true);
  };

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');

  const handleCheckOut = (person: EventParticipant) => {
    executeAction(
      { type: 'checkOut', eventParticipantId: person.Event_Participant_ID },
      `${personName(person)} checked out`
    );
  };

  const handleCheckIn = (person: EventParticipant) => {
    executeAction(
      { type: 'checkIn', eventParticipantId: person.Event_Participant_ID },
      `${personName(person)} checked back in`
    );
  };

  const handleChangeRoom = (person: EventParticipant, roomId: number | null) => {
    const msg =
      roomId === null
        ? `${personName(person)} unassigned from room`
        : `${personName(person)} moved to ${data?.rooms.find((r) => r.Room_ID === roomId)?.Room_Name ?? 'new room'}`;
    executeAction(
      { type: 'changeRoom', eventParticipantId: person.Event_Participant_ID, newRoomId: roomId },
      msg
    );
  };

  const handleCloseRoom = (roomId: number) => {
    const room = data?.rooms.find((r) => r.Room_ID === roomId);
    const eventRoomIds = (data?.eventRooms ?? [])
      .filter((er) => er.Room_ID === roomId)
      .map((er) => er.Event_Room_ID);
    executeAction(
      { type: 'closeRoom', roomId, eventRoomIds },
      `${room?.Room_Name ?? 'Room'} closed`
    );
  };

  const handleOpenRoom = (roomId: number) => {
    const room = data?.rooms.find((r) => r.Room_ID === roomId);
    const eventRoomIds = (data?.eventRooms ?? [])
      .filter((er) => er.Room_ID === roomId)
      .map((er) => er.Event_Room_ID);
    executeAction(
      { type: 'openRoom', roomId, eventRoomIds },
      `${room?.Room_Name ?? 'Room'} opened`
    );
  };

  // Filter participants by search
  const filterPeople = (people: EventParticipant[]) => {
    let filtered = people;
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="shrink-0">
                        <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                          Room
                        </label>
                        <select
                          value={selectedRoomId}
                          onChange={(e) => setSelectedRoomId(e.target.value)}
                          className="border-input bg-background text-foreground focus:ring-primary h-10 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none sm:w-auto"
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

                        // Check if all event rooms for this physical room are closed
                        const roomEventRooms = (data.eventRooms ?? []).filter(
                          (er) => er.Room_ID === room.Room_ID
                        );
                        const isRoomClosed =
                          !isUnassigned &&
                          roomEventRooms.length > 0 &&
                          roomEventRooms.every((er) => er.Closed);

                        // Hide rooms with no matching people when searching
                        if (searchQuery.trim() && people.length === 0) return null;

                        const capacityLabel =
                          !isUnassigned && room.Maximum_Capacity
                            ? `Capacity: ${checkedIn} / ${room.Maximum_Capacity}`
                            : `${checkedIn} checked in`;

                        return (
                          <div key={room.Room_ID ?? 'unassigned'}>
                            <div className="bg-background/80 sticky top-0 z-10 -mx-[calc((100vw-100%)/2)] px-[calc((100vw-100%)/2+1rem)] pt-2 pb-2 backdrop-blur-lg">
                              <SectionTitle
                                icon={isUnassigned ? AlertTriangle : isRoomClosed ? Lock : DoorOpen}
                                title={
                                  isUnassigned
                                    ? 'No Room Assigned'
                                    : `${room.Room_Name}${isRoomClosed ? ' (Closed)' : ''}`
                                }
                                subtitle={capacityLabel}
                                action={
                                  !isUnassigned && room.Room_ID != null
                                    ? isRoomClosed
                                      ? 'Open'
                                      : 'Close'
                                    : undefined
                                }
                                onAction={
                                  !isUnassigned && room.Room_ID != null
                                    ? isRoomClosed
                                      ? () => handleOpenRoom(room.Room_ID!)
                                      : () => handleCloseRoom(room.Room_ID!)
                                    : undefined
                                }
                              />
                            </div>

                            {/* People grid — sub-grouped by Group_Name */}
                            <div
                              className={`transition-all duration-300 ${isRoomClosed ? 'opacity-40 grayscale' : ''}`}
                            >
                              {people.length > 0 ? (
                                (() => {
                                  // Group people by Group_Name, preserving order
                                  const grouped = new Map<string, EventParticipant[]>();
                                  for (const p of people) {
                                    const key = p.Group_Name ?? '';
                                    if (!grouped.has(key)) grouped.set(key, []);
                                    grouped.get(key)!.push(p);
                                  }

                                  return (
                                    <div className="space-y-6">
                                      {Array.from(grouped.entries()).map(
                                        ([groupName, members], idx) => (
                                          <div key={groupName || '_ungrouped'}>
                                            {groupName && (
                                              <div
                                                className={`flex items-center gap-4 py-2 ${idx > 0 ? 'mt-2' : ''}`}
                                              >
                                                <div className="bg-border/50 h-px flex-1" />
                                                <span className="text-muted-foreground shrink-0 text-sm font-semibold tracking-wide uppercase">
                                                  {groupName}
                                                </span>
                                                <div className="bg-border/50 h-px flex-1" />
                                              </div>
                                            )}
                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                              {members.map((person) => (
                                                <PersonCard
                                                  key={person.Event_Participant_ID}
                                                  person={person}
                                                  onCheckOut={handleCheckOut}
                                                  onCheckIn={handleCheckIn}
                                                  onMoveRoom={handleMoveRoom}
                                                  onPersonClick={handlePersonClick}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  );
                                })()
                              ) : (
                                <div className="text-muted-foreground py-4 text-center text-xs">
                                  No one checked in
                                </div>
                              )}
                            </div>
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
        defaultPage={sheetDefaultPage}
      />
    </div>
  );
}
