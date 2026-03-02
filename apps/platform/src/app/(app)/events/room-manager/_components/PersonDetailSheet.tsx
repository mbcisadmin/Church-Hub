'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Clock,
  CheckCircle2,
  Users,
  ArrowRightLeft,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  ResponsiveSheet,
  SheetPage,
  useResponsiveSheet,
} from '@church/nextjs-ui/components/ResponsiveSheet';
import type { EventParticipant, Room } from '@/types/roomManager';

/** MP returns datetimes as local server time with a Z suffix — strip it so JS treats as local */
function parseMpDate(dateStr: string): Date {
  return new Date(dateStr.replace(/Z$/i, ''));
}
import type { HouseholdWithMembersResponse, HouseholdMember } from '@/services/peopleSearchService';

const FILE_URL = process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PersonDetailSheetProps {
  open: boolean;
  onClose: () => void;
  person: EventParticipant | null;
  roomName: string | null;
  rooms: Room[];
  onCheckOut: (p: EventParticipant) => void;
  onCheckIn: (p: EventParticipant) => void;
  onChangeRoom: (p: EventParticipant, roomId: number | null) => void;
  /** Which page to open on — 'main' or 'move-room' */
  defaultPage?: string;
}

// ---------------------------------------------------------------------------
// Avatar helpers
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

  // Reset error state when URL changes
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
        className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-white/20 font-semibold ${
          size === 'lg' ? 'text-white' : 'text-white'
        }`}
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

function MemberAvatar({ member, size = 'sm' }: { member: HouseholdMember; size?: 'sm' | 'lg' }) {
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

  const sizeClass = size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm';

  if (showImage) {
    return (
      <img
        src={imageUrl!}
        alt={`${firstName} ${member.Last_Name}`}
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
      <User className="h-5 w-5" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function PersonDetailHeader({
  person,
  roomName,
  contactId,
  onNavigate,
}: {
  person: EventParticipant;
  roomName: string | null;
  contactId: number | null;
  onNavigate: (path: string) => void;
}) {
  const firstName = person.Nickname || person.First_Name || '';
  const name = `${firstName} ${person.Last_Name ?? ''}`.trim();
  const initials = `${firstName.charAt(0)}${(person.Last_Name ?? '').charAt(0)}`.toUpperCase();

  return (
    <div className="bg-primary relative overflow-hidden px-4 pt-4 pb-5 md:px-6 md:pt-6 md:pb-6">
      {/* Mobile drag handle */}
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>

      {/* Watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <User className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      {/* Person info — clickable to people search */}
      <button
        className="relative z-10 flex w-full items-center gap-4 text-left"
        onClick={() => contactId && onNavigate(`/people/search?contactId=${contactId}`)}
        disabled={!contactId}
      >
        <PersonAvatar imageUrl={person.Image_URL} initials={initials} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold tracking-wide text-white md:text-2xl">
            {name}
          </h2>
          {person.Age != null && <p className="mt-0.5 text-sm text-white/70">Age {person.Age}</p>}
          {roomName && <p className="mt-0.5 text-sm text-white/70">{roomName}</p>}
        </div>
        {contactId && <ChevronRight className="h-5 w-5 shrink-0 text-white/50" />}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Household Section
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

function HouseholdSection({
  data,
  participantId,
}: {
  data: HouseholdWithMembersResponse;
  participantId: number;
}) {
  // Filter out the person we're already looking at
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
                <div key={member.Contact_ID} className="flex items-center gap-3">
                  <MemberAvatar member={member} />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">{name}</p>
                    {member.__Age != null && (
                      <p className="text-muted-foreground text-xs">Age {member.__Age}</p>
                    )}
                  </div>
                </div>
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
// Main Sheet
// ---------------------------------------------------------------------------

export default function PersonDetailSheet({
  open,
  onClose,
  person,
  roomName,
  rooms,
  onCheckOut,
  onCheckIn,
  onChangeRoom,
  defaultPage = 'main',
}: PersonDetailSheetProps) {
  const [household, setHousehold] = useState<HouseholdWithMembersResponse | null>(null);
  const [contactId, setContactId] = useState<number | null>(null);
  const [householdLoading, setHouseholdLoading] = useState(false);

  // Fetch household on open
  useEffect(() => {
    if (!open || !person) {
      setHousehold(null);
      setContactId(null);
      return;
    }

    setHouseholdLoading(true);
    setHousehold(null);
    setContactId(null);

    fetch(`/api/room-manager/household?participantId=${person.Participant_ID}`)
      .then((res) => res.json())
      .then((data) => {
        setContactId(data?.contactId ?? null);
        setHousehold(data?.household ?? null);
      })
      .catch(() => {
        // Silently fail — household is supplemental info
      })
      .finally(() => {
        setHouseholdLoading(false);
      });
  }, [open, person?.Participant_ID]);

  const router = useRouter();

  if (!person) return null;

  const firstName = person.Nickname || person.First_Name || '';
  const timeIn = person.Time_in ? parseMpDate(person.Time_in) : null;
  const formattedTime = timeIn ? format(timeIn, 'h:mm a') : '';
  const isCheckedOut = !!person.Time_Out;
  const timeOut = person.Time_Out ? parseMpDate(person.Time_Out) : null;
  const formattedTimeOut = timeOut ? format(timeOut, 'h:mm a') : '';

  const availableRooms = rooms.filter((r) => r.Room_ID !== null && r.Room_ID !== person.Room_ID);

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      panelClassName="bg-card overflow-hidden"
      maxWidth="max-w-2xl"
      noPanelPadding
      defaultPage={defaultPage}
      header={
        <PersonDetailHeader
          person={person}
          roomName={roomName}
          contactId={contactId}
          onNavigate={(path) => {
            onClose();
            router.push(path);
          }}
        />
      }
    >
      <SheetPage name="main">
        {/* Session Info */}
        <div className="space-y-2 border-b px-4 py-4 md:px-6">
          {person.Role_Title && (
            <div className="text-foreground flex items-center gap-2 text-sm">
              <User className="text-muted-foreground h-4 w-4 shrink-0" />
              <span>{person.Role_Title}</span>
            </div>
          )}
          {formattedTime && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                In {formattedTime}
                {isCheckedOut && formattedTimeOut && <span> · Out {formattedTimeOut}</span>}
              </span>
            </div>
          )}
          {person.Is_New && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Users className="h-4 w-4 shrink-0" />
              <span>New visitor</span>
            </div>
          )}
        </div>

        {/* Household */}
        {householdLoading && <HouseholdSkeleton />}
        {!householdLoading && household && (
          <HouseholdSection data={household} participantId={person.Participant_ID} />
        )}

        {/* Actions — always visible */}
        <div className="border-t">
          {!isCheckedOut && <MoveRoomButton />}
          {isCheckedOut ? (
            <button
              onClick={() => {
                onCheckIn(person);
                onClose();
              }}
              className="text-primary hover:bg-muted flex w-full items-center justify-center gap-1.5 border-t py-3 text-sm font-medium transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Check In
            </button>
          ) : (
            <button
              onClick={() => {
                onCheckOut(person);
                onClose();
              }}
              className="text-destructive hover:bg-muted flex w-full items-center justify-center gap-1.5 border-t py-3 text-sm font-medium transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Check Out
            </button>
          )}
        </div>
      </SheetPage>

      <SheetPage name="move-room" title="Move Room">
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
                  onChangeRoom(person, room.Room_ID!);
                  onClose();
                }}
                className="hover:bg-muted flex w-full items-center justify-between px-4 py-3 text-left transition-colors md:px-6"
              >
                <span className="text-foreground truncate text-sm font-medium">
                  {room.Room_Name}
                </span>
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
              onChangeRoom(person, null);
              onClose();
            }}
            className="text-destructive hover:bg-muted flex w-full items-center justify-center gap-1.5 border-t py-3 text-sm font-medium transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Unassign Room
          </button>
        )}
      </SheetPage>
    </ResponsiveSheet>
  );
}

/** Navigate to the move-room page from within the sheet */
function MoveRoomButton() {
  const { navigate } = useResponsiveSheet();
  return (
    <button
      onClick={() => navigate('move-room')}
      className="text-primary hover:bg-muted flex w-full items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors"
    >
      <ArrowRightLeft className="h-3.5 w-3.5" />
      Move Room
    </button>
  );
}
