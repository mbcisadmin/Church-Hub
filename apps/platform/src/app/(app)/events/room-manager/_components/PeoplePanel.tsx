'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowRightLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  User,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Room, EventParticipant, RoomManagerAction } from '@/types/roomManager';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** MP returns datetimes as local server time with a Z suffix — strip it */
function parseMpDate(dateStr: string): Date {
  return new Date(dateStr.replace(/Z$/i, ''));
}

function personName(p: EventParticipant) {
  const first = p.Nickname || p.First_Name || '';
  return `${first} ${p.Last_Name ?? ''}`.trim();
}

function getNewBadge(
  p: EventParticipant
): { label: string; colorClasses: string; cardClasses: string; Icon: LucideIcon } | null {
  if (p.Is_New)
    return {
      label: 'New',
      colorClasses: 'bg-green-100 text-green-700 dark:bg-green-400/20 dark:text-green-300',
      cardClasses: 'bg-green-400/20 text-green-200',
      Icon: Sparkles,
    };
  if (p.Is_New_Again)
    return {
      label: 'Returning',
      colorClasses: 'bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300',
      cardClasses: 'bg-blue-400/20 text-blue-200',
      Icon: RotateCcw,
    };
  if (p.Is_New_to_Congregation)
    return {
      label: 'New to Campus',
      colorClasses: 'bg-purple-100 text-purple-700 dark:bg-purple-400/20 dark:text-purple-300',
      cardClasses: 'bg-purple-400/20 text-purple-200',
      Icon: MapPin,
    };
  if (p.Is_New_to_Program)
    return {
      label: 'New to Program',
      colorClasses: 'bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300',
      cardClasses: 'bg-amber-400/20 text-amber-200',
      Icon: BookOpen,
    };
  return null;
}

function isVolunteer(p: EventParticipant): boolean {
  return p.Group_Role_Type_ID === 1 || p.Group_Role_Type_ID === 3;
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

function PersonAvatar({ person, size = 'sm' }: { person: EventParticipant; size?: 'sm' | 'md' }) {
  const [imgError, setImgError] = useState(false);
  const firstName = person.Nickname || person.First_Name;
  const initials =
    `${firstName?.charAt(0) ?? ''}${person.Last_Name?.charAt(0) ?? ''}`.toUpperCase();
  const showImage = person.Image_URL && !imgError;

  const sizeClass = size === 'md' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm';

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
// Panel
// ---------------------------------------------------------------------------

interface PeoplePanelProps {
  participants: EventParticipant[];
  rooms: Room[];
  roomName: string;
  onAction: (action: RoomManagerAction) => void;
  onPersonClick?: (participant: EventParticipant) => void;
}

export default function PeoplePanel({
  participants,
  rooms,
  roomName,
  onAction,
  onPersonClick,
}: PeoplePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (participants.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground text-sm">No people in {roomName}</p>
      </div>
    );
  }

  const filtered = searchQuery.trim()
    ? participants.filter((p) => {
        const name = `${p.Nickname || p.First_Name} ${p.Last_Name}`.toLowerCase();
        return name.includes(searchQuery.toLowerCase());
      })
    : participants;

  const volunteers = filtered.filter(isVolunteer);
  const attendees = filtered.filter((p) => !isVolunteer(p));

  return (
    <div>
      {/* Search */}
      <div className="bg-card sticky top-0 z-10 border-b px-4 py-2">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary h-8 w-full rounded-md border pr-3 pl-8 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Volunteers */}
      {volunteers.length > 0 && (
        <PeopleSection
          icon={Shield}
          label="Volunteers"
          people={volunteers}
          rooms={rooms}
          onAction={onAction}
          onPersonClick={onPersonClick}
        />
      )}

      {/* Participants */}
      {attendees.length > 0 && (
        <PeopleSection
          icon={User}
          label="Participants"
          people={attendees}
          rooms={rooms}
          onAction={onAction}
          onPersonClick={onPersonClick}
        />
      )}

      {searchQuery.trim() && filtered.length === 0 && (
        <div className="text-muted-foreground py-6 text-center text-sm">
          No results for &ldquo;{searchQuery}&rdquo;
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section (label + list on mobile / card grid on desktop)
// ---------------------------------------------------------------------------

function PeopleSection({
  icon: Icon,
  label,
  people,
  rooms,
  onAction,
  onPersonClick,
}: {
  icon: LucideIcon;
  label: string;
  people: EventParticipant[];
  rooms: Room[];
  onAction: (action: RoomManagerAction) => void;
  onPersonClick?: (participant: EventParticipant) => void;
}) {
  return (
    <>
      <SectionLabel icon={Icon} label={label} count={people.length} />

      {/* Mobile: list rows */}
      <div className="divide-border divide-y md:hidden">
        {people.map((p) => (
          <PersonRow
            key={p.Event_Participant_ID}
            person={p}
            rooms={rooms}
            onAction={onAction}
            onPersonClick={onPersonClick}
          />
        ))}
      </div>

      {/* Desktop: card grid */}
      <div className="hidden gap-3 p-4 md:grid md:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => (
          <PersonCard
            key={p.Event_Participant_ID}
            person={p}
            onCheckOut={() =>
              onAction({ type: 'checkOut', eventParticipantId: p.Event_Participant_ID })
            }
            onCheckIn={() =>
              onAction({ type: 'checkIn', eventParticipantId: p.Event_Participant_ID })
            }
            onPersonClick={onPersonClick ? () => onPersonClick(p) : undefined}
          />
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Section Label
// ---------------------------------------------------------------------------

function SectionLabel({
  icon: Icon,
  label,
  count,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
}) {
  return (
    <div className="bg-muted/50 flex items-center gap-2 border-y px-4 py-2">
      <Icon className="text-muted-foreground h-3.5 w-3.5" />
      <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </span>
      <span className="text-muted-foreground/70 text-xs">({count})</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Person Card (desktop — rich card from old v1)
// ---------------------------------------------------------------------------

function PersonCard({
  person,
  onCheckOut,
  onCheckIn,
  onPersonClick,
}: {
  person: EventParticipant;
  onCheckOut: () => void;
  onCheckIn: () => void;
  onPersonClick?: () => void;
}) {
  const timeIn = person.Time_in ? parseMpDate(person.Time_in) : null;
  const formattedTime = timeIn ? format(timeIn, 'h:mm a') : '';
  const isCheckedOut = !!person.Time_Out;
  const timeOut = person.Time_Out ? parseMpDate(person.Time_Out) : null;
  const formattedTimeOut = timeOut ? format(timeOut, 'h:mm a') : '';
  const isLoading = person._loading;
  const badge = getNewBadge(person);
  const volunteer = isVolunteer(person);
  const headerBg = isCheckedOut ? 'bg-muted' : volunteer ? 'bg-neutral-700' : 'bg-primary';

  return (
    <div
      className={`flex cursor-pointer flex-col overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-md ${isCheckedOut ? 'opacity-50' : ''} ${isLoading ? 'ring-primary/40 scale-[0.97] ring-2' : ''}`}
      onClick={onPersonClick}
    >
      {/* Card header — branded with avatar, name, age */}
      <div className={`flex flex-col items-center px-3 pt-2 pb-5 ${headerBg}`}>
        {/* Status badge row */}
        <div className="mb-1.5 flex h-[14px] w-full justify-end">
          {badge && (
            <span
              className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold uppercase ${badge.cardClasses}`}
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
        {person.Role_Title && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{person.Role_Title}</span>
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

      {/* Actions */}
      <div className="bg-card mt-auto border-t">
        {isCheckedOut ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCheckIn();
            }}
            className="text-primary hover:bg-muted flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all active:scale-95"
          >
            <CheckCircle2 className="h-3 w-3" />
            Check In
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCheckOut();
            }}
            className="text-destructive hover:bg-muted flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all active:scale-95"
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
// Person Row (mobile — compact list item)
// ---------------------------------------------------------------------------

function PersonRow({
  person: p,
  rooms,
  onAction,
  onPersonClick,
}: {
  person: EventParticipant;
  rooms: Room[];
  onAction: (action: RoomManagerAction) => void;
  onPersonClick?: (participant: EventParticipant) => void;
}) {
  const isCheckedIn = p.Time_in && !p.Time_Out;
  const isCheckedOut = !!p.Time_Out;
  const badge = getNewBadge(p);
  const firstName = p.Nickname || p.First_Name;
  const timeIn = p.Time_in ? parseMpDate(p.Time_in) : null;
  const timeOut = p.Time_Out ? parseMpDate(p.Time_Out) : null;
  const volunteer = isVolunteer(p);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${isCheckedOut ? 'opacity-50' : ''} ${onPersonClick ? 'hover:bg-muted/50 cursor-pointer transition-colors active:scale-[0.99]' : ''}`}
      onClick={() => onPersonClick?.(p)}
    >
      <PersonAvatar person={p} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-foreground truncate text-sm font-medium">
            {firstName} {p.Last_Name}
          </span>
          {volunteer && (
            <span className="rounded bg-neutral-200 px-1 py-0.5 text-[10px] leading-none font-semibold text-neutral-600 uppercase dark:bg-neutral-700 dark:text-neutral-300">
              Vol
            </span>
          )}
          {p._loading && <Loader2 className="text-primary h-3 w-3 shrink-0 animate-spin" />}
        </div>
        <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          {p.Age != null && <span>Age {p.Age}</span>}
          {p.Gender && <span>{p.Gender}</span>}
          {p.Role_Title && <span>{p.Role_Title}</span>}
          {timeIn && (
            <span>
              In {format(timeIn, 'h:mm a')}
              {timeOut && (
                <span className="text-muted-foreground/60"> · Out {format(timeOut, 'h:mm a')}</span>
              )}
            </span>
          )}
        </div>
        {badge && (
          <span
            className={`mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold ${badge.colorClasses}`}
          >
            <badge.Icon className="h-2.5 w-2.5" />
            {badge.label}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
          className="border-input bg-background text-foreground h-7 max-w-[100px] border px-1 text-xs focus:ring-2 focus:outline-none"
        >
          {rooms.map((r) => (
            <option key={r.Room_ID} value={r.Room_ID ?? ''}>
              {r.Room_Name}
            </option>
          ))}
        </select>

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

      {onPersonClick && <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />}
    </div>
  );
}
