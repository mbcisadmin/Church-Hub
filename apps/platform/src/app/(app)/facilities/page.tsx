'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Map,
  Wrench,
  DoorOpen,
  CalendarPlus,
  Search,
  Plus,
  Rocket,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { usePreserveParams } from '@/lib/usePreserveParams';

const MY_RESERVATIONS = [
  {
    id: '1',
    room: 'Fellowship Hall',
    date: 'Sat, Feb 15',
    time: '9:00 AM – 12:00 PM',
    event: 'Leadership Retreat Setup',
    status: 'approved' as const,
  },
  {
    id: '2',
    room: 'Room 201',
    date: 'Wed, Feb 19',
    time: '6:30 PM – 8:30 PM',
    event: 'Small Group Leader Training',
    status: 'pending' as const,
  },
  {
    id: '3',
    room: 'Chapel',
    date: 'Sun, Feb 23',
    time: '12:30 PM – 2:00 PM',
    event: 'Baptism Class',
    status: 'approved' as const,
  },
];

const FACILITIES_APPS = [
  {
    id: 'map',
    name: 'Campus Map',
    description: 'Interactive map of all campuses',
    icon: Map,
    route: '/facilities/map',
  },
  {
    id: 'room-manager',
    name: 'Room Manager',
    description: 'Manage event room assignments and check-ins',
    icon: DoorOpen,
    route: '/facilities/room-manager',
  },
  {
    id: 'rooms',
    name: 'Room Reservations',
    description: 'Book rooms and spaces',
    icon: DoorOpen,
    route: '/facilities/rooms',
  },
  {
    id: 'equipment',
    name: 'Equipment',
    description: 'Reserve A/V and event equipment',
    icon: Wrench,
    route: '/facilities/equipment',
  },
  {
    id: 'reserve',
    name: 'Quick Reserve',
    description: 'Submit a new reservation request',
    icon: CalendarPlus,
    route: '/facilities/reserve',
  },
];

export default function FacilitiesPage() {
  const router = useRouter();
  const { buildUrl } = usePreserveParams();

  const pageActions = useMemo(
    () => [
      {
        key: 'search',
        icon: Search,
        label: 'Search rooms',
        variant: 'secondary' as const,
        onAction: () => router.push(buildUrl('/facilities/rooms')),
      },
      {
        key: 'reserve',
        icon: Plus,
        label: 'New reservation',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/facilities/reserve')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Facilities | The Hub';
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <SectionHeader
          title="Facilities"
          subtitle="Manage rooms, equipment, and spaces"
          icon={Building2}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* My Reservations */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle
          icon={Clock}
          title="My Reservations"
          subtitle="Upcoming room and space bookings"
          action="View all"
          onAction={() => router.push(buildUrl('/facilities/rooms'))}
        />
        <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
          {MY_RESERVATIONS.map((res) => (
            <button
              key={res.id}
              onClick={() => router.push(buildUrl(`/facilities/rooms/${res.id}`))}
              className="hover:bg-muted/50 flex w-full items-center justify-between border-b p-4 text-left transition-colors last:border-b-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground text-sm font-medium">{res.room}</span>
                <span className="text-muted-foreground text-xs">{res.event}</span>
                <span className="text-muted-foreground text-xs">
                  {res.date} · {res.time}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {res.status === 'approved' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span
                  className={`text-xs font-medium capitalize ${res.status === 'approved' ? 'text-green-600' : 'text-amber-600'}`}
                >
                  {res.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Apps */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Facilities management tools" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {FACILITIES_APPS.map((app) => (
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
