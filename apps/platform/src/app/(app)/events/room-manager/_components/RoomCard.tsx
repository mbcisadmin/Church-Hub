'use client';

import {
  Loader2,
  XCircle,
  CheckCircle2,
  ChevronRight,
  Users,
  User,
  ArrowRightLeft,
} from 'lucide-react';

import { UNASSIGNED_ER } from './RoomDetailSheet';
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
  const activeParticipants = participants.filter((p) => p.Time_in && !p.Time_Out);
  const volunteers = activeParticipants.filter(
    (p) => p.Group_Role_Type_ID === 1 || p.Group_Role_Type_ID === 3
  ).length;
  const attendees = activeParticipants.length - volunteers;
  const maxCapacity = room.Maximum_Capacity;
  const percentage = maxCapacity ? Math.min((attendees / maxCapacity) * 100, 100) : 0;

  const openGroups = eventRooms.filter((er) => !er.Closed).length;
  const closedGroups = eventRooms.filter((er) => er.Closed).length;

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
            {attendees} / {maxCapacity ?? '—'}
          </span>
          {maxCapacity ? (
            <span className="text-muted-foreground text-xs">{Math.round(percentage)}%</span>
          ) : null}
        </div>
      </div>

      {/* Stats + Room Actions */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="flex items-center justify-between px-3 pb-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 text-xs">
          <Users className="text-muted-foreground h-3 w-3" />
          <span className="text-foreground">{volunteers}</span>
          <span className="text-muted-foreground">:</span>
          <User className="text-muted-foreground h-3 w-3" />
          <span className="text-foreground">{attendees}</span>
        </div>
        {eventRooms.length > 0 && (
          <div className="flex items-center gap-1">
            {closedGroups > 0 && (
              <button
                onClick={() =>
                  onAction(
                    {
                      type: 'openRoom',
                      roomId: room.Room_ID!,
                      eventRoomIds: eventRooms
                        .filter((er) => er.Closed)
                        .map((er) => er.Event_Room_ID),
                    },
                    `All groups in ${room.Room_Name} opened`
                  )
                }
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-green-600 transition-all hover:bg-green-50 active:scale-95 dark:hover:bg-green-950"
                title="Open all groups"
              >
                <CheckCircle2 className="h-3 w-3" />
                Open All
              </button>
            )}
            {openGroups > 0 && (
              <button
                onClick={() => onCloseAll()}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-red-500 transition-all hover:bg-red-50 active:scale-95 dark:hover:bg-red-950"
                title="Close all groups"
              >
                <XCircle className="h-3 w-3" />
                Close All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Group rows */}
      {eventRooms.length > 0 &&
        (() => {
          const openERs = eventRooms.filter((er) => !er.Closed);
          const closedERs = eventRooms.filter((er) => er.Closed);

          // Count checked-in participants per group from the same source as the room total
          const eventRoomGroupIds = new Set(eventRooms.map((er) => er.Group_ID).filter(Boolean));
          const checkedInByGroup = new Map<number, number>();
          let unassignedCount = 0;
          for (const p of participants) {
            if (!p.Time_in || p.Time_Out) continue;
            if (p.Group_ID != null && eventRoomGroupIds.has(p.Group_ID)) {
              checkedInByGroup.set(p.Group_ID, (checkedInByGroup.get(p.Group_ID) ?? 0) + 1);
            } else {
              // No group, or group not assigned to this room
              unassignedCount++;
            }
          }

          const renderRow = (er: EventRoom) => {
            const name = er.Group_Name || groupNameMap.get(er.Group_ID!) || `Group ${er.Group_ID}`;
            const groupCheckedIn =
              er.Group_ID != null ? (checkedInByGroup.get(er.Group_ID) ?? 0) : er.Checked_In;
            return (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <div
                key={er.Event_Room_ID}
                className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-2 border-b px-3 py-1.5 transition-colors last:border-b-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onGroupClick(er);
                }}
              >
                {/* Group name */}
                <span className="text-foreground min-w-0 flex-1 truncate text-xs">{name}</span>

                {/* Checked in count */}
                <span className="text-muted-foreground shrink-0 text-xs">{groupCheckedIn}</span>

                {/* Move button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveGroup(er);
                  }}
                  className="text-primary hover:bg-muted shrink-0 rounded p-0.5 transition-all active:scale-90"
                  title="Move group"
                >
                  <ArrowRightLeft className="h-3 w-3" />
                </button>

                {/* Close/Open toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction({
                      type: 'toggleClosed',
                      eventRoomId: er.Event_Room_ID,
                      closed: !er.Closed,
                    });
                  }}
                  className={`shrink-0 rounded p-0.5 transition-all active:scale-90 ${
                    er.Closed
                      ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
                      : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                  }`}
                  title={er.Closed ? 'Open group' : 'Close group'}
                >
                  {er.Closed ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                </button>

                {/* Chevron */}
                <ChevronRight className="text-muted-foreground h-3 w-3 shrink-0" />
              </div>
            );
          };

          return (
            <div className="border-border border-t">
              {openERs.length > 0 && (
                <>
                  <div className="bg-muted/30 px-3 py-1 text-[10px] font-semibold tracking-wider text-green-600 uppercase">
                    Open ({openERs.length})
                  </div>
                  {openERs.map(renderRow)}
                </>
              )}
              {closedERs.length > 0 && (
                <>
                  <div className="bg-muted/30 border-border border-t px-3 py-1 text-[10px] font-semibold tracking-wider text-red-500 uppercase">
                    Closed ({closedERs.length})
                  </div>
                  {closedERs.map(renderRow)}
                </>
              )}
              {unassignedCount > 0 && (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                  className="border-border hover:bg-muted/50 flex cursor-pointer items-center gap-2 border-t px-3 py-1.5 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGroupClick(UNASSIGNED_ER);
                  }}
                >
                  <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs italic">
                    Unassigned
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">{unassignedCount}</span>
                  <ChevronRight className="text-muted-foreground h-3 w-3 shrink-0" />
                </div>
              )}
            </div>
          );
        })()}

      {/* spacer when no groups */}
      {eventRooms.length === 0 && <div className="pb-1" />}
    </div>
  );
}
