'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowRightLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  DoorOpen,
  LogOut,
  MapPin,
  RotateCcw,
  Sparkles,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  ResponsiveSheet,
  SheetPage,
  useResponsiveSheet,
} from '@church/nextjs-ui/components/ResponsiveSheet';
import PeoplePanel from './PeoplePanel';
import type {
  Room,
  EventRoom,
  EventGroup,
  EventParticipant,
  RoomManagerAction,
} from '@/types/roomManager';
import type { HouseholdWithMembersResponse, HouseholdMember } from '@/services/peopleSearchService';

const FILE_URL = process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseMpDate(dateStr: string): Date {
  return new Date(dateStr.replace(/Z$/i, ''));
}

function isVolunteer(p: EventParticipant): boolean {
  return p.Group_Role_Type_ID === 1 || p.Group_Role_Type_ID === 3;
}

function getNewBadge(
  p: EventParticipant
): { label: string; colorClasses: string; Icon: LucideIcon } | null {
  if (p.Is_New)
    return {
      label: 'New visitor',
      colorClasses: 'text-green-600 dark:text-green-400',
      Icon: Sparkles,
    };
  if (p.Is_New_Again)
    return {
      label: 'Returning visitor',
      colorClasses: 'text-blue-600 dark:text-blue-400',
      Icon: RotateCcw,
    };
  if (p.Is_New_to_Congregation)
    return {
      label: 'New to campus',
      colorClasses: 'text-purple-600 dark:text-purple-400',
      Icon: MapPin,
    };
  if (p.Is_New_to_Program)
    return {
      label: 'New to program',
      colorClasses: 'text-amber-600 dark:text-amber-400',
      Icon: BookOpen,
    };
  return null;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RoomDetailSheetProps {
  open: boolean;
  onClose: () => void;
  room: Room | null;
  eventRooms: EventRoom[];
  participants: EventParticipant[];
  groups: EventGroup[];
  allRooms: Room[];
  onAction: (action: RoomManagerAction, successMessage?: string) => void;
  initialGroupER: EventRoom | null;
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function RoomDetailHeader({
  room,
  participants,
  selectedGroupName,
  selectedPerson,
}: {
  room: Room;
  participants: EventParticipant[];
  selectedGroupName: string | null;
  selectedPerson: EventParticipant | null;
}) {
  const checkedIn = participants.filter((p) => p.Time_in && !p.Time_Out).length;
  const { currentPage } = useResponsiveSheet();

  const subtitle = [
    room.Building_Name,
    room.Maximum_Capacity != null && `Capacity: ${room.Maximum_Capacity}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const isGroupPeoplePage = currentPage === 'group-people';
  const isPersonPage = currentPage === 'person-detail' || currentPage === 'person-move-room';

  // Person detail header
  if (isPersonPage && selectedPerson) {
    const firstName = selectedPerson.Nickname || selectedPerson.First_Name || '';
    const name = `${firstName} ${selectedPerson.Last_Name ?? ''}`.trim();
    const initials =
      `${firstName.charAt(0)}${(selectedPerson.Last_Name ?? '').charAt(0)}`.toUpperCase();
    const headerBg = isVolunteer(selectedPerson) ? 'bg-neutral-700' : 'bg-primary';

    return (
      <div
        className={`${headerBg} relative overflow-hidden px-4 pt-4 pb-5 md:px-6 md:pt-6 md:pb-6`}
      >
        <div className="mb-3 flex justify-center md:hidden">
          <div className="h-1.5 w-14 rounded-full bg-white/30" />
        </div>
        <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
          <User className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <PersonAvatar imageUrl={selectedPerson.Image_URL} initials={initials} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold tracking-wide text-white md:text-2xl">
              {name}
            </h2>
            {selectedPerson.Age != null && (
              <p className="mt-0.5 text-sm text-white/70">Age {selectedPerson.Age}</p>
            )}
            {selectedPerson.Room_Name && (
              <p className="mt-0.5 text-sm text-white/70">{selectedPerson.Room_Name}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Room header
  return (
    <div className="bg-primary relative overflow-hidden px-4 pt-4 pb-4 md:px-6 md:pt-6 md:pb-5">
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <DoorOpen className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>
      <div className="relative z-10">
        <h2 className="text-xl font-bold tracking-wide text-white md:text-2xl">{room.Room_Name}</h2>
        {isGroupPeoplePage && selectedGroupName ? (
          <p className="mt-1 text-sm text-white/70">{selectedGroupName}</p>
        ) : (
          <>
            {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
            <p className="mt-1 text-sm text-white/70">{checkedIn} checked in</p>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Person Avatar (for header)
// ---------------------------------------------------------------------------

function PersonAvatar({
  imageUrl,
  initials,
  size = 'sm',
}: {
  imageUrl?: string | null;
  initials: string;
  size?: 'sm' | 'lg';
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = imageUrl && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  const sizeClass = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-10 w-10 text-sm';

  if (showImage) {
    return (
      <img
        src={imageUrl!}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  if (initials) {
    return (
      <div
        className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-white/20 font-semibold text-white`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-white/20`}
    >
      <User className={size === 'lg' ? 'h-8 w-8 text-white' : 'h-5 w-5 text-white'} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Person Detail Page Content
// ---------------------------------------------------------------------------

function PersonDetailPage({
  person,
  rooms,
  onAction,
}: {
  person: EventParticipant;
  rooms: Room[];
  onAction: (action: RoomManagerAction, successMessage?: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const { navigate } = useResponsiveSheet();
  const [household, setHousehold] = useState<HouseholdWithMembersResponse | null>(null);
  const [householdLoading, setHouseholdLoading] = useState(false);

  useEffect(() => {
    setHouseholdLoading(true);
    setHousehold(null);

    fetch(`/api/room-manager/household?participantId=${person.Participant_ID}`)
      .then((res) => res.json())
      .then((data) => setHousehold(data?.household ?? null))
      .catch(() => {})
      .finally(() => setHouseholdLoading(false));
  }, [person.Participant_ID]);

  const timeIn = person.Time_in ? parseMpDate(person.Time_in) : null;
  const formattedTime = timeIn ? format(timeIn, 'h:mm a') : '';
  const isCheckedOut = !!person.Time_Out;
  const timeOut = person.Time_Out ? parseMpDate(person.Time_Out) : null;
  const formattedTimeOut = timeOut ? format(timeOut, 'h:mm a') : '';

  return (
    <>
      {/* Session Info */}
      <div className="space-y-2.5 border-b px-4 py-4 md:px-6">
        {person.Group_Name && (
          <div className="text-sm">
            <span className="text-muted-foreground font-medium">Group:</span>{' '}
            <span className="text-foreground">{person.Group_Name}</span>
          </div>
        )}
        {person.Role_Title && (
          <div className="text-sm">
            <span className="text-muted-foreground font-medium">Role:</span>{' '}
            <span className="text-foreground">{person.Role_Title}</span>
          </div>
        )}
        {person.Gender && (
          <div className="text-sm">
            <span className="text-muted-foreground font-medium">Gender:</span>{' '}
            <span className="text-foreground">{person.Gender}</span>
          </div>
        )}
        {formattedTime && (
          <div className="text-sm">
            <span className="text-muted-foreground font-medium">Time:</span>{' '}
            <span className="text-foreground">
              In {formattedTime}
              {isCheckedOut && formattedTimeOut && <span> · Out {formattedTimeOut}</span>}
            </span>
          </div>
        )}
        {(() => {
          const badge = getNewBadge(person);
          return badge ? (
            <div className={`flex items-center gap-1.5 text-sm font-medium ${badge.colorClasses}`}>
              <badge.Icon className="h-3.5 w-3.5" />
              {badge.label}
            </div>
          ) : null;
        })()}
        {person.Contact_ID && (
          <button
            onClick={() => router.push(`/people/search?contactId=${person.Contact_ID}`)}
            className="text-primary flex items-center gap-1 text-sm font-medium transition-all hover:opacity-70"
          >
            View Full Profile
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Household */}
      {householdLoading && <HouseholdSkeleton />}
      {!householdLoading && household && (
        <HouseholdSection
          data={household}
          participantId={person.Participant_ID}
          onMemberClick={(cId) => router.push(`/people/search?contactId=${cId}`)}
        />
      )}

      {/* Actions */}
      <div className="border-t">
        {!isCheckedOut && (
          <button
            onClick={() => navigate('person-move-room')}
            className="text-primary hover:bg-muted flex w-full items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all active:scale-95"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Move Room
          </button>
        )}
        {isCheckedOut ? (
          <button
            onClick={() => {
              onAction(
                { type: 'checkIn', eventParticipantId: person.Event_Participant_ID },
                `${person.Nickname || person.First_Name} ${person.Last_Name} checked back in`
              );
            }}
            className="text-primary hover:bg-muted flex w-full items-center justify-center gap-1.5 border-t py-3 text-sm font-medium transition-all active:scale-95"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Check In
          </button>
        ) : (
          <button
            onClick={() => {
              onAction(
                { type: 'checkOut', eventParticipantId: person.Event_Participant_ID },
                `${person.Nickname || person.First_Name} ${person.Last_Name} checked out`
              );
            }}
            className="text-destructive hover:bg-muted flex w-full items-center justify-center gap-1.5 border-t py-3 text-sm font-medium transition-all active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            Check Out
          </button>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Person Move Room Page
// ---------------------------------------------------------------------------

function PersonMoveRoomPage({
  person,
  rooms,
  onAction,
}: {
  person: EventParticipant;
  rooms: Room[];
  onAction: (action: RoomManagerAction, successMessage?: string) => void;
}) {
  const { goBack } = useResponsiveSheet();
  const availableRooms = rooms.filter((r) => r.Room_ID !== null && r.Room_ID !== person.Room_ID);
  const firstName = person.Nickname || person.First_Name || '';

  return (
    <>
      <div className="px-4 py-3 md:px-6">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Move to
        </p>
      </div>
      {availableRooms.length > 0 ? (
        <div className="divide-y">
          {availableRooms.map((room) => (
            <button
              key={room.Room_ID}
              onClick={() => {
                onAction(
                  {
                    type: 'changeRoom',
                    eventParticipantId: person.Event_Participant_ID,
                    newRoomId: room.Room_ID!,
                  },
                  `${firstName} ${person.Last_Name} moved to ${room.Room_Name}`
                );
                goBack();
              }}
              className="hover:bg-muted flex w-full items-center justify-between px-4 py-3 text-left transition-all active:scale-[0.98] md:px-6"
            >
              <span className="text-foreground truncate text-sm font-medium">{room.Room_Name}</span>
              {room.Maximum_Capacity != null && (
                <span className="text-muted-foreground ml-2 shrink-0 text-xs">
                  {room.Still_Checked_In ?? 0}/{room.Maximum_Capacity}
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground px-4 py-6 text-center text-sm md:px-6">
          No other rooms available for this event
        </p>
      )}
      {person.Room_ID != null && (
        <button
          onClick={() => {
            onAction(
              {
                type: 'changeRoom',
                eventParticipantId: person.Event_Participant_ID,
                newRoomId: null,
              },
              `${firstName} ${person.Last_Name} unassigned from room`
            );
            goBack();
          }}
          className="text-destructive hover:bg-muted flex w-full items-center justify-center gap-1.5 border-t py-3 text-sm font-medium transition-all active:scale-95"
        >
          <LogOut className="h-3.5 w-3.5" />
          Unassign Room
        </button>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Household helpers
// ---------------------------------------------------------------------------

const POSITION_ORDER = ['Head of Household', 'Spouse', 'Child', 'Other'];

function groupByPosition(
  members: HouseholdMember[]
): { position: string; members: HouseholdMember[] }[] {
  const groups = new Map<string, HouseholdMember[]>();
  for (const m of members) {
    const pos = m.Household_Position || 'Other';
    if (!groups.has(pos)) groups.set(pos, []);
    groups.get(pos)!.push(m);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      const ai = POSITION_ORDER.indexOf(a);
      const bi = POSITION_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    })
    .map(([position, members]) => ({ position, members }));
}

function MemberAvatar({ member }: { member: HouseholdMember }) {
  const firstName = member.Nickname || member.First_Name;
  const initials =
    `${firstName?.charAt(0) ?? ''}${member.Last_Name?.charAt(0) ?? ''}`.toUpperCase();
  const imageUrl =
    member.Image_GUID && FILE_URL ? `${FILE_URL}/${member.Image_GUID}?$thumbnail=true` : null;
  const [imgError, setImgError] = useState(false);
  const showImage = imageUrl && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  if (showImage) {
    return (
      <img
        src={imageUrl!}
        alt={`${firstName} ${member.Last_Name}`}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  }
  if (initials) {
    return (
      <div className="bg-muted text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        {initials}
      </div>
    );
  }
  return (
    <div className="bg-muted text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
      <User className="h-5 w-5" />
    </div>
  );
}

function HouseholdSection({
  data,
  participantId,
  onMemberClick,
}: {
  data: HouseholdWithMembersResponse;
  participantId: number;
  onMemberClick: (contactId: number) => void;
}) {
  const otherMembers = data.Members.filter((m) => m.Participant_Record !== participantId);
  const grouped = groupByPosition(otherMembers);
  if (otherMembers.length === 0) return null;

  return (
    <div className="divide-y">
      {grouped.map(({ position, members }) => (
        <div key={position} className="px-4 py-3 md:px-6">
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
            {position}
          </p>
          <div className="space-y-2.5">
            {members.map((member) => {
              const firstName = member.Nickname || member.First_Name;
              const name = `${firstName} ${member.Last_Name ?? ''}`.trim();
              return (
                <button
                  key={member.Contact_ID}
                  onClick={() => onMemberClick(member.Contact_ID)}
                  className="hover:bg-muted -mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-all active:scale-[0.98]"
                >
                  <MemberAvatar member={member} />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">{name}</p>
                    {member.__Age != null && (
                      <p className="text-muted-foreground text-xs">Age {member.__Age}</p>
                    )}
                  </div>
                  <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function HouseholdSkeleton() {
  return (
    <div className="px-4 py-4 md:px-6">
      <div className="flex items-center gap-2">
        <div className="bg-muted h-4 w-4 animate-pulse rounded" />
        <div className="bg-muted h-4 w-32 animate-pulse rounded" />
      </div>
      <div className="mt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="bg-muted h-3.5 w-28 animate-pulse rounded" />
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Group navigation bar (shown above people list on main page)
// ---------------------------------------------------------------------------

function GroupNavBar({
  eventRooms,
  groups,
  onSelectGroup,
}: {
  eventRooms: EventRoom[];
  groups: EventGroup[];
  onSelectGroup: (er: EventRoom) => void;
}) {
  const { navigate } = useResponsiveSheet();
  const groupNameMap = new Map(groups.map((g) => [g.Group_ID, g.Group_Name]));

  if (eventRooms.length === 0) return null;

  return (
    <div className="border-border border-b px-4 py-3 md:px-6">
      <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase">
        <Users className="h-3.5 w-3.5" />
        Groups
      </p>
      <div className="flex flex-wrap gap-2">
        {eventRooms.map((er) => {
          const name = er.Group_Name || groupNameMap.get(er.Group_ID!) || `Group ${er.Group_ID}`;
          return (
            <button
              key={er.Event_Room_ID}
              onClick={() => {
                onSelectGroup(er);
                navigate('group-people');
              }}
              className="bg-muted hover:bg-muted/80 text-foreground flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95"
            >
              {name}
              <span className="text-muted-foreground">({er.Checked_In})</span>
              <ChevronRight className="text-muted-foreground h-3 w-3" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Sheet
// ---------------------------------------------------------------------------

export default function RoomDetailSheet({
  open,
  onClose,
  room,
  eventRooms,
  participants,
  groups,
  allRooms,
  onAction,
  initialGroupER,
}: RoomDetailSheetProps) {
  const [selectedGroupER, setSelectedGroupER] = useState<EventRoom | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<EventParticipant | null>(null);

  // defaultPage: 'main' for all people, 'group-people' when drilling into a group
  // ResponsiveSheet seeds history as ['main', 'group-people'] so back → main
  const defaultPage = initialGroupER ? 'group-people' : 'main';

  // Reset state when opening a new room
  useEffect(() => {
    if (open) {
      setSelectedGroupER(initialGroupER);
      setSelectedPerson(null);
    }
  }, [open, room?.Room_ID, initialGroupER]);

  if (!room) return null;

  // Resolve group name
  const resolvedGroupName = selectedGroupER
    ? (selectedGroupER.Group_Name ??
      groups.find((g) => g.Group_ID === selectedGroupER.Group_ID)?.Group_Name ??
      null)
    : null;

  // Filter participants for selected group
  const groupParticipants = selectedGroupER
    ? participants.filter((p) => {
        if (selectedGroupER.Group_ID != null && p.Group_ID != null) {
          return p.Group_ID === selectedGroupER.Group_ID;
        }
        if (resolvedGroupName) return p.Group_Name === resolvedGroupName;
        return p.Group_Name === null;
      })
    : [];

  const firstName = selectedPerson
    ? selectedPerson.Nickname || selectedPerson.First_Name || ''
    : '';
  const personTitle = selectedPerson ? `${firstName} ${selectedPerson.Last_Name ?? ''}`.trim() : '';

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      panelClassName="bg-card overflow-hidden"
      maxWidth="max-w-5xl"
      noPanelPadding
      defaultPage={defaultPage}
      header={
        <RoomDetailHeader
          room={room}
          participants={participants}
          selectedGroupName={resolvedGroupName}
          selectedPerson={selectedPerson}
        />
      }
    >
      <SheetPage name="main">
        <GroupNavBar eventRooms={eventRooms} groups={groups} onSelectGroup={setSelectedGroupER} />
        <PeoplePanelWithNav
          participants={participants}
          rooms={allRooms}
          roomName={room.Room_Name}
          onAction={onAction}
          onSelectPerson={setSelectedPerson}
        />
      </SheetPage>
      <SheetPage
        name="group-people"
        title={resolvedGroupName ?? `Group ${selectedGroupER?.Group_ID ?? ''}`}
      >
        <PeoplePanelWithNav
          participants={groupParticipants}
          rooms={allRooms}
          roomName={resolvedGroupName ?? `Group ${selectedGroupER?.Group_ID ?? ''}`}
          onAction={onAction}
          onSelectPerson={setSelectedPerson}
        />
      </SheetPage>
      <SheetPage name="person-detail" title={personTitle}>
        {selectedPerson && (
          <PersonDetailPage
            person={selectedPerson}
            rooms={allRooms}
            onAction={onAction}
            onClose={onClose}
          />
        )}
      </SheetPage>
      <SheetPage name="person-move-room" title="Move Room">
        {selectedPerson && (
          <PersonMoveRoomPage person={selectedPerson} rooms={allRooms} onAction={onAction} />
        )}
      </SheetPage>
    </ResponsiveSheet>
  );
}

// ---------------------------------------------------------------------------
// Wrapper: PeoplePanel with person navigation
// ---------------------------------------------------------------------------

function PeoplePanelWithNav({
  participants,
  rooms,
  roomName,
  onAction,
  onSelectPerson,
}: {
  participants: EventParticipant[];
  rooms: Room[];
  roomName: string;
  onAction: (action: RoomManagerAction, successMessage?: string) => void;
  onSelectPerson: (person: EventParticipant) => void;
}) {
  const { navigate } = useResponsiveSheet();

  return (
    <PeoplePanel
      participants={participants}
      rooms={rooms}
      roomName={roomName}
      onAction={onAction}
      onPersonClick={(p) => {
        onSelectPerson(p);
        navigate('person-detail');
      }}
    />
  );
}
