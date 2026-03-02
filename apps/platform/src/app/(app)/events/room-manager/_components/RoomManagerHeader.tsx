'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Loader2, Users, UserCheck, User } from 'lucide-react';
import { DateSwiper } from '@church/nextjs-ui/date-swiper';
import { useCampus } from '@/contexts/CampusContext';
import type { RoomManagerData } from '@/types/roomManager';

type Event = {
  Event_ID: number;
  Event_Title: string;
  Event_Start_Date: string;
  Event_End_Date: string;
  Event_Type?: string;
};

interface RoomManagerHeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedEventId: number | null;
  onEventChange: (eventId: number | null) => void;
  data: RoomManagerData | null;
}

export default function RoomManagerHeader({
  selectedDate,
  onDateChange,
  selectedEventId,
  onEventChange,
  data,
}: RoomManagerHeaderProps) {
  const { selectedCampus } = useCampus();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Load events when date or campus changes
  useEffect(() => {
    if (!selectedDate) {
      setEvents([]);
      return;
    }

    async function loadEvents() {
      setIsLoadingEvents(true);
      try {
        let url = `/api/counter/events?date=${selectedDate}&requireRooms=true`;
        if (selectedCampus) {
          url += `&congregationId=${selectedCampus.Congregation_ID}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data);

        // Auto-select first event if none selected
        if (data.length > 0 && !selectedEventId) {
          onEventChange(data[0].Event_ID);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    }

    loadEvents();
  }, [selectedDate, selectedCampus?.Congregation_ID]);

  // Group events by Event_Type for the dropdown
  const eventsByType = useMemo(() => {
    const groups = new Map<string, Event[]>();
    for (const event of events) {
      const type = event.Event_Type || 'Other';
      if (!groups.has(type)) groups.set(type, []);
      groups.get(type)!.push(event);
    }
    return groups;
  }, [events]);

  // Use pre-computed stats from the SP event dataset
  const totalAttending = data?.event?.Still_Checked_In ?? 0;
  const totalVolunteers = data?.event?.Volunteers_In ?? 0;
  const totalParticipants = data?.event?.Participants_In ?? 0;

  return (
    <div className="space-y-4">
      {/* Date Swiper */}
      <DateSwiper
        value={selectedDate}
        onChange={(newDate) => {
          onDateChange(newDate);
          onEventChange(null);
        }}
        showArch
        archGradientColor="#e5e7eb"
      />

      {/* Event Picker */}
      <div>
        <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
          Event
        </h3>
        {isLoadingEvents ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No events found for this date
          </p>
        ) : (
          <select
            value={selectedEventId ?? ''}
            onChange={(e) => onEventChange(e.target.value ? parseInt(e.target.value) : null)}
            className="border-input bg-background text-foreground h-10 w-full border px-3 text-sm focus:ring-2 focus:outline-none"
          >
            <option value="">Select an event</option>
            {[...eventsByType.entries()].map(([type, typeEvents]) => (
              <optgroup key={type} label={type}>
                {typeEvents.map((event) => (
                  <option key={event.Event_ID} value={event.Event_ID}>
                    {event.Event_Title} — {format(new Date(event.Event_Start_Date), 'h:mm a')}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
      </div>

      {/* Stats Bar */}
      {data && selectedEventId && (
        <div className="flex gap-4 border-t pt-3">
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground font-semibold">{totalAttending}</span>
            <span className="text-muted-foreground">Attending</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <UserCheck className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground font-semibold">{totalVolunteers}</span>
            <span className="text-muted-foreground">Volunteers</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <User className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground font-semibold">{totalParticipants}</span>
            <span className="text-muted-foreground">Participants</span>
          </div>
        </div>
      )}
    </div>
  );
}
