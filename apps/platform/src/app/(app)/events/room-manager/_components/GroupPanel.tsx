'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Switch } from '@church/nextjs-ui/ui/switch';
import type { EventRoom, RoomManagerAction } from '@/types/roomManager';

interface GroupPanelProps {
  eventRooms: EventRoom[];
  roomName: string;
  onAction: (action: RoomManagerAction) => void;
}

export default function GroupPanel({ eventRooms, roomName, onAction }: GroupPanelProps) {
  // Track which fields have pending debounced saves
  const [pendingCapacity, setPendingCapacity] = useState<Record<number, number | null>>({});
  const [pendingPriority, setPendingPriority] = useState<Record<number, number | null>>({});

  const handleCapacityChange = (eventRoomId: number, value: string) => {
    const num = value === '' ? null : parseInt(value);
    setPendingCapacity((prev) => ({ ...prev, [eventRoomId]: num }));
  };

  const handleCapacityBlur = (eventRoomId: number) => {
    const value = pendingCapacity[eventRoomId];
    if (value !== undefined) {
      onAction({ type: 'setCheckInCapacity', eventRoomId, capacity: value });
      setPendingCapacity((prev) => {
        const next = { ...prev };
        delete next[eventRoomId];
        return next;
      });
    }
  };

  const handlePriorityChange = (eventRoomId: number, value: string) => {
    const num = value === '' ? null : parseInt(value);
    setPendingPriority((prev) => ({ ...prev, [eventRoomId]: num }));
  };

  const handlePriorityBlur = (eventRoomId: number) => {
    const value = pendingPriority[eventRoomId];
    if (value !== undefined) {
      onAction({ type: 'setBalancePriority', eventRoomId, priority: value });
      setPendingPriority((prev) => {
        const next = { ...prev };
        delete next[eventRoomId];
        return next;
      });
    }
  };

  if (eventRooms.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground text-sm">No groups assigned to {roomName}</p>
      </div>
    );
  }

  return (
    <div className="divide-border divide-y">
      {eventRooms.map((er) => {
        const capacityValue =
          pendingCapacity[er.Event_Room_ID] !== undefined
            ? pendingCapacity[er.Event_Room_ID]
            : er.Check_In_Capacity;
        const priorityValue =
          pendingPriority[er.Event_Room_ID] !== undefined
            ? pendingPriority[er.Event_Room_ID]
            : er.Balance_Priority;

        return (
          <div key={er.Event_Room_ID} className="space-y-3 p-4">
            {/* Group Name + Loading */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-foreground text-sm font-medium">
                  {er.Group_Name || `Group ${er.Group_ID}`}
                </span>
                {er._loading && <Loader2 className="text-primary h-3 w-3 animate-spin" />}
              </div>
              <span className="text-muted-foreground text-xs">{er.Checked_In} checked in</span>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs">
                <Switch
                  checked={er.Closed}
                  onCheckedChange={(checked) =>
                    onAction({
                      type: 'toggleClosed',
                      eventRoomId: er.Event_Room_ID,
                      closed: !!checked,
                    })
                  }
                />
                <span className="text-muted-foreground">Closed</span>
              </label>

              <label className="flex items-center gap-2 text-xs">
                <Switch
                  checked={er.Auto_Close_At_Capacity}
                  onCheckedChange={(checked) =>
                    onAction({
                      type: 'toggleAutoClose',
                      eventRoomId: er.Event_Room_ID,
                      autoClose: !!checked,
                    })
                  }
                />
                <span className="text-muted-foreground">Auto Close</span>
              </label>
            </div>

            {/* Number Inputs */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-muted-foreground mb-1 block text-xs">
                  Check-in Capacity
                </label>
                <input
                  type="number"
                  min="0"
                  value={capacityValue ?? ''}
                  onChange={(e) => handleCapacityChange(er.Event_Room_ID, e.target.value)}
                  onBlur={() => handleCapacityBlur(er.Event_Room_ID)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCapacityBlur(er.Event_Room_ID);
                  }}
                  className="border-input bg-background text-foreground h-8 w-full border px-2 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-muted-foreground mb-1 block text-xs">Balance Priority</label>
                <input
                  type="number"
                  min="0"
                  value={priorityValue ?? ''}
                  onChange={(e) => handlePriorityChange(er.Event_Room_ID, e.target.value)}
                  onBlur={() => handlePriorityBlur(er.Event_Room_ID)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePriorityBlur(er.Event_Room_ID);
                  }}
                  className="border-input bg-background text-foreground h-8 w-full border px-2 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
