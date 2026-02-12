'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Search,
  ClipboardList,
  Ticket,
  XCircle,
  Hash,
  Plus,
  Pin,
  CalendarDays,
  User,
  Rocket,
  Star,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { EventCard } from '@church/nextjs-ui/components/EventCard';
import { FeaturedEventCard } from '@church/nextjs-ui/components/FeaturedEventCard';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import PinSheet from '@/components/PinSheet';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { getPinnedEventsForLevel } from '@/lib/mockData';

// Apps within the Events category
const EVENTS_APPS = [
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'View and manage all events',
    icon: Calendar,
    route: '/events/calendar',
  },
  {
    id: 'finder',
    name: 'Finder',
    description: 'Search for specific events',
    icon: Search,
    route: '/events/finder',
  },
  {
    id: 'registration',
    name: 'Registration',
    description: 'Manage event signups',
    icon: ClipboardList,
    route: '/events/registration',
  },
  {
    id: 'ticketed',
    name: 'Ticketed',
    description: 'Paid events and tickets',
    icon: Ticket,
    route: '/events/ticketed',
  },
  {
    id: 'cancellations',
    name: 'Cancellations',
    description: 'Handle event cancellations',
    icon: XCircle,
    route: '/events/cancellations',
  },
  {
    id: 'counter',
    name: 'Counter',
    description: 'Track attendance counts',
    icon: Hash,
    route: '/events/counter',
  },
];

// Pinned items within Events - these would come from user preferences
const PINNED_EVENTS = [
  { id: '1', label: 'Winter Retreat 2026', route: '/events/456' },
  { id: '2', label: 'Staff Meeting', route: '/events/789' },
  { id: '3', label: 'Youth Group', route: '/events/101' },
];

// My Events - events user is registered for or serving at
const MY_EVENTS = [
  {
    id: '1',
    title: 'Guest Services',
    type: 'Serving',
    day: 'Sun',
    date: '9',
    time: '8:30 AM',
    route: '/events/serve-123',
  },
  {
    id: '2',
    title: 'Winter Retreat',
    type: 'Registered',
    day: 'Fri',
    date: '21',
    time: '6:00 PM',
    route: '/events/456',
  },
  {
    id: '3',
    title: 'Worship Team',
    type: 'Serving',
    day: 'Sun',
    date: '16',
    time: '7:00 AM',
    route: '/events/serve-456',
  },
];

// Upcoming Events - general upcoming events
const UPCOMING_EVENTS = [
  {
    id: '1',
    title: 'Staff Meeting',
    day: 'Thu',
    date: '13',
    time: '9:00 AM',
    route: '/events/789',
  },
  { id: '2', title: 'Youth Group', day: 'Sun', date: '16', time: '5:00 PM', route: '/events/101' },
  { id: '3', title: 'Prayer Night', day: 'Wed', date: '19', time: '7:00 PM', route: '/events/102' },
  {
    id: '4',
    title: 'Winter Retreat',
    day: 'Fri',
    date: '21',
    time: '6:00 PM',
    route: '/events/456',
  },
  {
    id: '5',
    title: 'Worship Night',
    day: 'Sat',
    date: '22',
    time: '6:00 PM',
    route: '/events/103',
  },
];

// Featured Events - special events that get prominent display
const FEATURED_EVENTS = [
  {
    id: '456',
    title: 'Winter Retreat 2026',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop',
    dateRange: 'Feb 21-23, 2026',
    badge: 'Retreat',
    subtitle: 'Camp Barakel',
    route: '/events/456',
  },
];

export default function EventsCategoryPage() {
  const router = useRouter();
  const { accessLevel } = useTestingContext();
  const { buildUrl } = usePreserveParams();
  const [pinSheetOpen, setPinSheetOpen] = useState(false);
  const [pinnedItems, setPinnedItems] = useState(PINNED_EVENTS);

  const pageActions = useMemo(
    () => [
      {
        key: 'pin',
        icon: Pin,
        label: 'Manage pinned events',
        variant: 'tertiary' as const,
        onAction: () => setPinSheetOpen(true),
      },
      {
        key: 'search',
        icon: Search,
        label: 'Search events',
        variant: 'secondary' as const,
        onAction: () => {
          /* TODO: Open search sheet scoped to Events */
        },
      },
      {
        key: 'new-event',
        icon: Plus,
        label: 'New event',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/events/new')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Events | The Hub';
  }, []);

  // Get events based on access level
  const pinnedEventsFromLevel = getPinnedEventsForLevel(accessLevel);

  // Filter my events based on access level
  const filteredMyEvents =
    accessLevel === 'low'
      ? MY_EVENTS.slice(0, 1)
      : accessLevel === 'medium'
        ? MY_EVENTS.slice(0, 2)
        : MY_EVENTS;

  // Filter upcoming events based on access level
  const filteredUpcoming =
    accessLevel === 'low'
      ? UPCOMING_EVENTS.slice(0, 3)
      : accessLevel === 'medium'
        ? UPCOMING_EVENTS.slice(0, 4)
        : UPCOMING_EVENTS;

  // Filter apps based on access level
  const filteredApps =
    accessLevel === 'low'
      ? EVENTS_APPS.filter((a) => ['calendar', 'finder'].includes(a.id))
      : accessLevel === 'medium'
        ? EVENTS_APPS.filter((a) =>
            ['calendar', 'finder', 'registration', 'counter'].includes(a.id)
          )
        : EVENTS_APPS;

  // Check if current page is pinned (the Events category page itself)
  const isCurrentPagePinned = pinnedItems.some((item) => item.route === '/events');

  const handlePinCurrentPage = () => {
    const newPin = {
      id: `pin-${Date.now()}`,
      label: 'Events',
      route: '/events',
    };
    setPinnedItems((prev) => [...prev, newPin]);
  };

  const handleRemovePin = (id: string) => {
    setPinnedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Category Header */}
      <header>
        <SectionHeader
          title="Events"
          subtitle="Manage calendars, registrations, and attendance"
          icon={Calendar}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* Pin Sheet */}
      <PinSheet
        open={pinSheetOpen}
        onClose={() => setPinSheetOpen(false)}
        category="Events"
        currentPageTitle="Events Category"
        pinnedItems={pinnedItems}
        isCurrentPagePinned={isCurrentPagePinned}
        onPinCurrentPage={handlePinCurrentPage}
        onRemovePin={handleRemovePin}
      />

      {/* Featured Events Section */}
      {FEATURED_EVENTS.length > 0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle icon={Star} title="Featured" subtitle="Don't miss these events" />
          <HorizontalScroll>
            {FEATURED_EVENTS.map((event) => (
              <FeaturedEventCard
                key={event.id}
                title={event.title}
                imageUrl={event.imageUrl}
                dateRange={event.dateRange}
                badge={event.badge}
                subtitle={event.subtitle}
                onClick={() => router.push(buildUrl(event.route))}
              />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* My Events Section */}
      {filteredMyEvents.length > 0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle
            icon={User}
            title="My Events"
            subtitle="Events you're registered for or serving at"
          />
          <HorizontalScroll>
            {filteredMyEvents.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                day={event.day}
                date={event.date}
                time={event.time}
                type={event.type}
                showWatermark={false}
                onClick={() => router.push(buildUrl(event.route))}
              />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* Upcoming Events Section */}
      {filteredUpcoming.length > 0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle icon={CalendarDays} title="Upcoming" subtitle="What's happening soon" />
          <HorizontalScroll>
            {filteredUpcoming.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                day={event.day}
                date={event.date}
                time={event.time}
                showWatermark={false}
                onClick={() => router.push(buildUrl(event.route))}
              />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* Apps Grid */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Event management tools" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              name={app.name}
              description={app.description}
              icon={app.icon}
              onClick={() => router.push(buildUrl(app.route))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
