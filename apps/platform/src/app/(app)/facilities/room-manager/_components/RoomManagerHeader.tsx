'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Loader2, Users, UserCheck, User } from 'lucide-react';
import { DateSwiper } from '@church/nextjs-ui/date-swiper';
import type { RoomManagerData } from '@/types/roomManager';

type Event = {
  Event_ID: number;
  Event_Title: string;
  Event_Start_Date: string;
  Event_End_Date: string;
};

type Congregation = {
  Congregation_ID: number;
  Congregation_Name: string;
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
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [selectedCongregationId, setSelectedCongregationId] = useState<number | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Load congregations on mount
  useEffect(() => {
    async function loadCongregations() {
      try {
        const response = await fetch('/api/counter/congregations');
        if (!response.ok) throw new Error('Failed to fetch congregations');
        const data = await response.json();
        const list: Congregation[] = data.congregations || data;
        setCongregations(list);
        if (list.length > 0) {
          setSelectedCongregationId(list[0].Congregation_ID);
        }
      } catch (error) {
        console.error('Error loading congregations:', error);
      }
    }
    loadCongregations();
  }, []);

  // Load events when date or campus changes
  useEffect(() => {
    if (!selectedDate) {
      setEvents([]);
      return;
    }

    async function loadEvents() {
      setIsLoadingEvents(true);
      try {
        let url = `/api/counter/events?date=${selectedDate}`;
        if (selectedCongregationId) {
          url += `&congregationId=${selectedCongregationId}`;
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
  }, [selectedDate, selectedCongregationId]);

  // Compute stats from data
  const totalAttending = data?.participants.filter((p) => p.Time_In && !p.Time_Out).length ?? 0;
  const totalVolunteers =
    data?.participants.filter((p) => p.Time_In && !p.Time_Out && p.Group_Role_ID !== null).length ??
    0;
  const totalParticipants = totalAttending - totalVolunteers;

  return (
    <div className="space-y-4">
      {/* Campus Picker */}
      {congregations.length > 1 && (
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCongregationId ?? ''}
            onChange={(e) => {
              setSelectedCongregationId(parseInt(e.target.value));
              onEventChange(null);
            }}
            className="border-input bg-background text-foreground h-9 border px-3 text-sm focus:ring-2 focus:outline-none"
          >
            {congregations.map((c) => (
              <option key={c.Congregation_ID} value={c.Congregation_ID}>
                {c.Congregation_Name}
              </option>
            ))}
          </select>
        </div>
      )}

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
            {events.map((event) => (
              <option key={event.Event_ID} value={event.Event_ID}>
                {event.Event_Title} — {format(new Date(event.Event_Start_Date), 'h:mm a')}
              </option>
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
