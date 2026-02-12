'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Users,
  Search,
  UserPlus,
  History,
  Pin,
  Mail,
  Phone,
  Home,
  Heart,
  Rocket,
  BarChart3,
  ClipboardList,
  Settings,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { SectionHeader } from '@church/nextjs-ui/components/SectionHeader';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { PersonCard } from '@church/nextjs-ui/components/PersonCard';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { createUnpinAction } from '@church/nextjs-ui/components/CardActions';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import ChurchLogo from '@/components/ChurchLogo';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { getPinnedPeopleForLevel } from '@/lib/mockData';

// Mock recent people
const RECENT_PEOPLE = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'Small Groups Director',
    imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    role: 'Worship Pastor',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Williams',
    role: 'Kids Ministry Lead',
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Martinez',
    role: 'Guest Services',
    imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    id: '5',
    firstName: 'Jessica',
    lastName: 'Brown',
    role: 'Youth Volunteer',
    imageUrl: 'https://randomuser.me/api/portraits/women/90.jpg',
  },
];

// Apps within the People category
const PEOPLE_APPS = [
  {
    id: 'households',
    name: 'Households',
    description: 'See who lives together and manage family links',
    icon: Home,
    route: '/people/households',
  },
  {
    id: 'my-connections',
    name: 'My Connections',
    description: 'Discover people in your same groups and events',
    icon: Heart,
    route: '/people/connections',
  },
  {
    id: 'directory',
    name: 'Staff Directory',
    description: 'Look up staff, pastors, and ministry leaders',
    icon: UsersRound,
    route: '/people/directory',
  },
];

// Admin apps
const ADMIN_APPS = [
  {
    id: 'new-person',
    name: 'Add Person',
    description: 'Create a new record',
    icon: UserPlus,
    route: '/people/new',
  },
  {
    id: 'duplicates',
    name: 'Duplicates',
    description: 'Merge duplicate records',
    icon: UserCheck,
    route: '/people/admin/duplicates',
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'People analytics',
    icon: BarChart3,
    route: '/people/admin/reports',
  },
  {
    id: 'bulk-actions',
    name: 'Bulk Actions',
    description: 'Update multiple records',
    icon: ClipboardList,
    route: '/people/admin/bulk',
  },
];

export default function PeoplePage() {
  const router = useRouter();
  const { status } = useSession();
  const { accessLevel } = useTestingContext();
  const { buildUrl } = usePreserveParams();
  const isAuthLoading = status === 'loading';
  const [loading, setLoading] = useState(true);

  const pageActions = useMemo(
    () => [
      {
        key: 'search',
        icon: Search,
        label: 'Search people',
        variant: 'secondary' as const,
        onAction: () => router.push(buildUrl('/people/search')),
      },
      {
        key: 'add',
        icon: UserPlus,
        label: 'Add person',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/people/new')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'People | The Hub';
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Get pinned people based on access level
  const pinnedPeople = getPinnedPeopleForLevel(accessLevel);

  // Get recent people based on access level
  const recentPeople =
    accessLevel === 'low'
      ? RECENT_PEOPLE.slice(0, 2)
      : accessLevel === 'medium'
        ? RECENT_PEOPLE.slice(0, 3)
        : RECENT_PEOPLE;

  // Get apps based on access level
  const apps = accessLevel === 'low' ? PEOPLE_APPS.slice(0, 2) : PEOPLE_APPS;
  const adminApps = accessLevel === 'high' ? ADMIN_APPS : [];

  if (isAuthLoading || loading) {
    return (
      <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
        <section className="relative flex flex-col items-center">
          <SectionHeader
            title="Loading"
            subtitle="Getting people data"
            icon={Users}
            variant="watermark"
            as="h1"
            className="mb-8 md:mb-16"
          />
          <LogoSpinner logo={<ChurchLogo className="text-foreground" />} />
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Category Header */}
      <header>
        <SectionHeader
          title="People"
          subtitle="Find and connect with your community"
          icon={Users}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* Pinned People Section */}
      {pinnedPeople.length > 0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle
            icon={Pin}
            title="Pinned"
            subtitle="Your frequently contacted people"
            iconAnimation="poke"
            animationFrequency="occasional"
          />
          <HorizontalScroll>
            {pinnedPeople.map((person) => {
              const unpinAction = createUnpinAction(() => {
                console.log('Unpin:', person.id);
              });
              return (
                <PersonCard
                  key={person.id}
                  name={`${person.firstName} ${person.lastName}`}
                  role={person.role}
                  initials={`${person.firstName[0]}${person.lastName[0]}`}
                  avatarUrl={person.imageUrl}
                  onClick={() => router.push(buildUrl(`/people/search/${person.id}`))}
                  actions={[unpinAction]}
                />
              );
            })}
          </HorizontalScroll>
        </section>
      )}

      {/* Recent People Section */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle
          icon={History}
          title="Recent"
          subtitle="People you've viewed recently"
          iconAnimation="tilt"
          animationFrequency="occasional"
        />
        <HorizontalScroll>
          {recentPeople.map((person) => (
            <PersonCard
              key={person.id}
              name={`${person.firstName} ${person.lastName}`}
              role={person.role}
              initials={`${person.firstName[0]}${person.lastName[0]}`}
              avatarUrl={person.imageUrl}
              onClick={() => router.push(buildUrl(`/people/search/${person.id}`))}
            />
          ))}
        </HorizontalScroll>
      </section>

      {/* Apps Grid */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Tools for managing people" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {apps.map((app) => (
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

      {/* Admin Tools (only for high access) */}
      {adminApps.length > 0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle icon={Settings} title="Admin Tools" subtitle="Manage people records" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {adminApps.map((app) => (
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
      )}
    </div>
  );
}
