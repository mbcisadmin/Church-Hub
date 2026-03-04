'use client';

import { Loader2, Lock, Users, User, ArrowRightLeft } from 'lucide-react';
import { Switch } from '@church/nextjs-ui/ui/switch';
import { Button } from '@/components/ui/button';
import type {
  Room,
  EventRoom,
  EventParticipant,
  EventGroup,
  RoomManagerAction,
} from '@/types/roomManager';

interface RoomCardProps {
  room: Room;
  eventRooms: EventRoom[];
  participants: EventParticipant[];
  groups: EventGroup[];
  highlighted: boolean;
  onClick: () => void;
  onCloseAll: () => void;
  onAction: (action: RoomManagerAction, successMessage?: string) => void;
  onMoveGroup: (eventRoom: EventRoom) => void;
  onGroupClick: (eventRoom: EventRoom) => void;
}

export default function RoomCard({
  room,
  eventRooms,
  participants,
  groups,
  highlighted,
  onClick,
  onCloseAll,
  onAction,
  onMoveGroup,
  onGroupClick,
}: RoomCardProps) {
  const checkedIn = participants.filter((p) => p.Time_in && !p.Time_Out).length;
  const maxCapacity = room.Maximum_Capacity;
  const percentage = maxCapacity ? Math.min((checkedIn / maxCapacity) * 100, 100) : 0;

  const openGroups = eventRooms.filter((er) => !er.Closed).length;

  const volunteers = participants.filter(
    (p) => p.Time_in && !p.Time_Out && p.Group_Role_ID !== null
  ).length;
  const attendees = checkedIn - volunteers;

  // Capacity color
  const capacityColor =
    percentage >= 90 ? 'bg-red-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-green-500';
  const capacityTextColor =
    percentage >= 90 ? 'text-red-600' : percentage >= 75 ? 'text-amber-600' : 'text-green-600';

  const isAnyLoading = eventRooms.some((er) => er._loading);

  // Group name lookup
  const groupNameMap = new Map(groups.map((g) => [g.Group_ID, g.Group_Name]));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`bg-card cursor-pointer border text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${
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
          {maxCapacity ? (
            <span className="text-muted-foreground text-xs">{Math.round(percentage)}%</span>
          ) : null}
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
      </div>

      {/* Group rows */}
      {eventRooms.length > 0 && (
        <div className="border-border border-t">
          {eventRooms.map((er) => {
            const name = er.Group_Name || groupNameMap.get(er.Group_ID!) || `Group ${er.Group_ID}`;
            return (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <div
                key={er.Event_Room_ID}
                className="border-border flex items-center gap-2 border-b px-3 py-1.5 last:border-b-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close toggle */}
                <Switch
                  checked={er.Closed}
                  onCheckedChange={(checked) =>
                    onAction({
                      type: 'toggleClosed',
                      eventRoomId: er.Event_Room_ID,
                      closed: !!checked,
                    })
                  }
                  className="scale-75"
                />

                {/* Group name - clickable to view people */}
                <button
                  onClick={() => onGroupClick(er)}
                  className="hover:bg-muted/50 flex min-w-0 flex-1 items-center gap-1.5 rounded py-0.5 text-left transition-colors"
                >
                  {er.Closed && <Lock className="h-2.5 w-2.5 shrink-0 text-red-400" />}
                  <span
                    className={`truncate text-xs ${er.Closed ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                  >
                    {name}
                  </span>
                </button>

                {/* Checked in count */}
                <span className="text-muted-foreground shrink-0 text-xs">{er.Checked_In}</span>

                {/* Move button */}
                <button
                  onClick={() => onMoveGroup(er)}
                  className="text-primary hover:bg-muted shrink-0 rounded p-0.5 transition-all active:scale-90"
                  title="Move group"
                >
                  <ArrowRightLeft className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {eventRooms.length > 0 && openGroups > 0 && (
        <div className="border-border flex items-center gap-1 border-t px-2 py-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onCloseAll();
            }}
            className="text-destructive hover:text-destructive h-7 rounded-none text-xs"
          >
            Close All
          </Button>
        </div>
      )}
    </div>
  );
}
