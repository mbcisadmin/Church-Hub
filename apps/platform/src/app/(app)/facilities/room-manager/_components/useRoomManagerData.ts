import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { RoomManagerData, RoomManagerAction } from '@/types/roomManager';

const POLL_INTERVAL = 5000;

export function useRoomManagerData(eventId: number | null) {
  const [data, setData] = useState<RoomManagerData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousDataRef = useRef<string>('');

  const fetchData = useCallback(async (id: number, isPolling = false) => {
    if (!isPolling) setIsLoading(true);
    try {
      const response = await fetch(`/api/room-manager?eventId=${id}`);
      if (!response.ok) throw new Error('Failed to fetch room manager data');
      const newData: RoomManagerData = await response.json();

      const dataString = JSON.stringify(newData);
      if (dataString !== previousDataRef.current) {
        previousDataRef.current = dataString;
        setData(newData);
      }
      setError(null);
    } catch (err) {
      if (!isPolling) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
      console.error('Error fetching room manager data:', err);
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  }, []);

  // Fetch on eventId change
  useEffect(() => {
    if (!eventId) {
      setData(null);
      previousDataRef.current = '';
      return;
    }

    fetchData(eventId);
  }, [eventId, fetchData]);

  // Poll every 5s
  useEffect(() => {
    if (!eventId) return;

    const interval = setInterval(() => {
      fetchData(eventId, true);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [eventId, fetchData]);

  const executeAction = useCallback(
    async (action: RoomManagerAction) => {
      if (!eventId || !data) return;

      // Optimistic UI updates
      const previousData = { ...data };

      switch (action.type) {
        case 'closeAll': {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  eventRooms: prev.eventRooms.map((er) =>
                    action.eventRoomIds.includes(er.Event_Room_ID)
                      ? { ...er, Closed: true, _loading: true }
                      : er
                  ),
                }
              : prev
          );
          break;
        }
        case 'toggleClosed': {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  eventRooms: prev.eventRooms.map((er) =>
                    er.Event_Room_ID === action.eventRoomId
                      ? { ...er, Closed: action.closed, _loading: true }
                      : er
                  ),
                }
              : prev
          );
          break;
        }
        case 'toggleAutoClose': {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  eventRooms: prev.eventRooms.map((er) =>
                    er.Event_Room_ID === action.eventRoomId
                      ? { ...er, Auto_Close_At_Capacity: action.autoClose, _loading: true }
                      : er
                  ),
                }
              : prev
          );
          break;
        }
        case 'setCheckInCapacity': {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  eventRooms: prev.eventRooms.map((er) =>
                    er.Event_Room_ID === action.eventRoomId
                      ? { ...er, Check_In_Capacity: action.capacity, _loading: true }
                      : er
                  ),
                }
              : prev
          );
          break;
        }
        case 'setBalancePriority': {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  eventRooms: prev.eventRooms.map((er) =>
                    er.Event_Room_ID === action.eventRoomId
                      ? { ...er, Balance_Priority: action.priority, _loading: true }
                      : er
                  ),
                }
              : prev
          );
          break;
        }
        case 'checkOut': {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  participants: prev.participants.map((p) =>
                    p.Event_Participant_ID === action.eventParticipantId
                      ? { ...p, Time_Out: new Date().toISOString(), _loading: true }
                      : p
                  ),
                }
              : prev
          );
          break;
        }
        case 'checkIn': {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  participants: prev.participants.map((p) =>
                    p.Event_Participant_ID === action.eventParticipantId
                      ? { ...p, Time_In: new Date().toISOString(), Time_Out: null, _loading: true }
                      : p
                  ),
                }
              : prev
          );
          break;
        }
        case 'changeRoom': {
          const targetRoom = data.rooms.find((r) => r.Room_ID === action.newRoomId);
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  participants: prev.participants.map((p) =>
                    p.Event_Participant_ID === action.eventParticipantId
                      ? {
                          ...p,
                          Room_ID: action.newRoomId,
                          Room_Name: targetRoom?.Room_Name ?? p.Room_Name,
                          _loading: true,
                        }
                      : p
                  ),
                }
              : prev
          );
          break;
        }
      }

      // Execute the action
      try {
        const response = await fetch('/api/room-manager/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action),
        });

        if (!response.ok) {
          throw new Error('Failed to execute action');
        }

        toast.success(getActionSuccessMessage(action));

        // Re-fetch to get authoritative data
        await fetchData(eventId, true);
      } catch (err) {
        console.error('Error executing action:', err);
        setData(previousData);
        toast.error('Action failed. Please try again.');
      }
    },
    [eventId, data, fetchData]
  );

  return { data, isLoading, error, executeAction, refetch: () => eventId && fetchData(eventId) };
}

function getActionSuccessMessage(action: RoomManagerAction): string {
  switch (action.type) {
    case 'closeAll':
      return 'All groups closed';
    case 'toggleClosed':
      return action.closed ? 'Group closed' : 'Group opened';
    case 'toggleAutoClose':
      return action.autoClose ? 'Auto-close enabled' : 'Auto-close disabled';
    case 'setCheckInCapacity':
      return 'Check-in capacity updated';
    case 'setBalancePriority':
      return 'Balance priority updated';
    case 'checkOut':
      return 'Checked out';
    case 'checkIn':
      return 'Checked in';
    case 'changeRoom':
      return 'Room changed';
  }
}
