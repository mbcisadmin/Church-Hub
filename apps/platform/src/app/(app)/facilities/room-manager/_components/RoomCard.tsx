'use client';

import { Loader2, Lock, Unlock, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Room, EventRoom, EventParticipant } from '@/types/roomManager';

interface RoomCardProps {
  room: Room;
  eventRooms: EventRoom[];
  participants: EventParticipant[];
  highlighted: boolean;
  onCloseAll: () => void;
  onOpenGroups: () => void;
  onOpenPeople: () => void;
}

export default function RoomCard({
  room,
  eventRooms,
  participants,
  highlighted,
  onCloseAll,
  onOpenGroups,
  onOpenPeople,
}: RoomCardProps) {
  const checkedIn = participants.filter((p) => p.Time_In && !p.Time_Out).length;
  const maxCapacity = room.Maximum_Capacity;
  const percentage = maxCapacity ? Math.min((checkedIn / maxCapacity) * 100, 100) : 0;

  const openGroups = eventRooms.filter((er) => !er.Closed).length;
  const closedGroups = eventRooms.filter((er) => er.Closed).length;

  const volunteers = participants.filter(
    (p) => p.Time_In && !p.Time_Out && p.Group_Role_ID !== null
  ).length;
  const attendees = checkedIn - volunteers;

  // Capacity color
  const capacityColor =
    percentage >= 90 ? 'bg-red-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-green-500';
  const capacityTextColor =
    percentage >= 90 ? 'text-red-600' : percentage >= 75 ? 'text-amber-600' : 'text-green-600';

  const isAnyLoading = eventRooms.some((er) => er._loading);

  return (
    <div
      className={`bg-card border transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${
        highlighted ? 'border-primary ring-primary/20 ring-2' : 'border-border'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-sm font-semibold">{room.Room_Name}</h3>
          {isAnyLoading && <Loader2 className="text-primary h-3 w-3 animate-spin" />}
        </div>
        {room.Building_Name && (
          <span className="text-muted-foreground text-xs">{room.Building_Name}</span>
        )}
      </div>

      {/* Capacity Bar */}
      <div className="px-3 pb-2">
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-500 ${capacityColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className={`text-xs font-semibold ${capacityTextColor}`}>
            {checkedIn} / {maxCapacity ?? '—'}
          </span>
          {maxCapacity && (
            <span className="text-muted-foreground text-xs">{Math.round(percentage)}%</span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 px-3 pb-2">
        <div className="flex items-center gap-1 text-xs">
          <Users className="text-muted-foreground h-3 w-3" />
          <span className="text-foreground">{volunteers}</span>
          <span className="text-muted-foreground">:</span>
          <User className="text-muted-foreground h-3 w-3" />
          <span className="text-foreground">{attendees}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-0.5">
            <Unlock className="h-3 w-3 text-green-500" />
            <span className="text-foreground">{openGroups}</span>
          </span>
          <span className="flex items-center gap-0.5">
            <Lock className="h-3 w-3 text-red-400" />
            <span className="text-foreground">{closedGroups}</span>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="border-border flex items-center gap-1 border-t px-2 py-1.5">
        {eventRooms.length > 0 && openGroups > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onCloseAll}
            className="text-destructive hover:text-destructive h-7 rounded-none text-xs"
          >
            Close All
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onOpenGroups}
          className="h-7 rounded-none text-xs"
        >
          Groups ({eventRooms.length})
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onOpenPeople}
          className="h-7 rounded-none text-xs"
        >
          People ({checkedIn})
        </Button>
      </div>
    </div>
  );
}
