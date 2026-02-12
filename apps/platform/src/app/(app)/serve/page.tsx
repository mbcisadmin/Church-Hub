'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Handshake,
  Lock,
  Search,
  Plus,
  Calendar,
  Users,
  Clock,
  MapPin,
  Rocket,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  UserPlus,
  ClipboardList,
  Settings,
  BarChart3,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/ui/section-header';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { EventCard } from '@church/nextjs-ui/components/EventCard';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { OpportunityCard } from '@church/nextjs-ui/components/OpportunityCard';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import ChurchLogo from '@/components/ChurchLogo';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';

// Mock serving teams
interface ServingTeam {
  id: string;
  name: string;
  role: string;
  nextServing?: string;
  location?: string;
  memberCount: number;
  status: 'active' | 'on-break' | 'pending';
}

const MY_TEAMS: ServingTeam[] = [
  {
    id: '1',
    name: 'Guest Services',
    role: 'Greeter',
    nextServing: 'Sun, Feb 9 • 8:30 AM',
    location: 'Main Lobby',
    memberCount: 24,
    status: 'active',
  },
  {
    id: '2',
    name: 'Worship Team',
    role: 'Vocalist',
    nextServing: 'Sun, Feb 16 • 7:00 AM',
    location: 'Auditorium',
    memberCount: 18,
    status: 'active',
  },
  {
    id: '3',
    name: 'Kids Ministry',
    role: 'Small Group Leader',
    nextServing: 'Sun, Feb 9 • 9:00 AM',
    location: 'Kids Wing',
    memberCount: 45,
    status: 'active',
  },
  {
    id: '4',
    name: 'Production Team',
    role: 'Camera Operator',
    memberCount: 12,
    status: 'on-break',
  },
];

// Mock upcoming serving opportunities
const UPCOMING_SERVING = [
  {
    id: '1',
    title: 'Guest Services',
    day: 'Sun',
    date: '9',
    time: '8:30 AM',
    location: 'Main Lobby',
    team: 'Guest Services',
    status: 'confirmed',
  },
  {
    id: '2',
    title: 'Kids Check-In',
    day: 'Sun',
    date: '9',
    time: '9:00 AM',
    location: 'Kids Wing',
    team: 'Kids Ministry',
    status: 'confirmed',
  },
  {
    id: '3',
    title: 'Worship Team',
    day: 'Sun',
    date: '16',
    time: '7:00 AM',
    location: 'Auditorium',
    team: 'Worship',
    status: 'confirmed',
  },
  {
    id: '4',
    title: 'Prayer Team',
    day: 'Sun',
    date: '23',
    time: '10:30 AM',
    location: 'Prayer Room',
    team: 'Prayer',
    status: 'pending',
  },
];

// Mock open opportunities
const OPEN_OPPORTUNITIES = [
  {
    id: 'o1',
    title: 'Nursery Helper',
    date: 'Sun, Feb 9',
    time: '11:00 AM',
    team: 'Kids Ministry',
    urgency: 'high',
  },
  {
    id: 'o2',
    title: 'Parking Lot',
    date: 'Sun, Feb 9',
    time: '8:00 AM',
    team: 'Guest Services',
    urgency: 'medium',
  },
  {
    id: 'o3',
    title: 'Coffee Bar',
    date: 'Sun, Feb 16',
    time: '8:30 AM',
    team: 'Hospitality',
    urgency: 'low',
  },
];

// Apps within the Serve category
const SERVE_APPS = [
  {
    id: 'my-schedule',
    name: 'My Schedule',
    description: 'Check when and where you serve next',
    icon: Calendar,
    route: '/serve/schedule',
  },
  {
    id: 'find-opportunity',
    name: 'Find Opportunity',
    description: 'Browse open spots and sign up to serve',
    icon: Search,
    route: '/serve/opportunities',
  },
  {
    id: 'my-teams',
    name: 'My Teams',
    description: 'See your teams and manage memberships',
    icon: Users,
    route: '/serve/teams',
  },
  {
    id: 'availability',
    name: 'Availability',
    description: 'Block dates and set your schedule preferences',
    icon: Clock,
    route: '/serve/availability',
  },
];

// Admin apps
const ADMIN_APPS = [
  {
    id: 'team-manager',
    name: 'Team Manager',
    description: 'Manage serving teams',
    icon: Settings,
    route: '/serve/admin/teams',
  },
  {
    id: 'scheduling',
    name: 'Scheduling',
    description: 'Create and manage schedules',
    icon: ClipboardList,
    route: '/serve/admin/scheduling',
  },
  {
    id: 'volunteer-reports',
    name: 'Reports',
    description: 'Volunteer analytics',
    icon: BarChart3,
    route: '/serve/admin/reports',
  },
  {
    id: 'recruitment',
    name: 'Recruitment',
    description: 'Manage volunteer recruitment',
    icon: UserPlus,
    route: '/serve/admin/recruitment',
  },
];

// Team card component
function TeamCard({ team, onClick }: { team: ServingTeam; onClick: () => void }) {
  const statusColors = {
    active: 'bg-green-500/10 text-green-600',
    'on-break': 'bg-amber-500/10 text-amber-600',
    pending: 'bg-blue-500/10 text-blue-600',
  };

  const statusLabels = {
    active: 'Active',
    'on-break': 'On Break',
    pending: 'Pending',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card hover:bg-muted/50 relative flex h-44 w-56 flex-shrink-0 flex-col overflow-hidden rounded-xl border p-4 text-left shadow-sm transition-all hover:shadow-md"
    >
      {/* Status badge */}
      <div
        className={`mb-2 flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[team.status]}`}
      >
        {team.status === 'active' ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : team.status === 'pending' ? (
          <Clock className="h-3 w-3" />
        ) : (
          <AlertCircle className="h-3 w-3" />
        )}
        {statusLabels[team.status]}
      </div>

      {/* Team name */}
      <h3 className="text-foreground text-sm font-bold tracking-wide uppercase">{team.name}</h3>

      {/* Role */}
      <p className="text-muted-foreground mt-0.5 text-xs">{team.role}</p>

      {/* Footer */}
      <div className="mt-auto space-y-1.5">
        {team.nextServing && (
          <span className="text-primary flex items-center gap-1 text-xs font-medium">
            <Calendar className="h-3 w-3" />
            {team.nextServing}
          </span>
        )}
        {team.location && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            {team.location}
          </span>
        )}
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <Users className="h-3 w-3" />
          {team.memberCount} members
        </span>
      </div>
    </motion.button>
  );
}

function EmptyState() {
  const router = useRouter();
  const { buildUrl } = usePreserveParams();

  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
      <section className="relative flex flex-col items-center">
        <SectionHeader
          title="Start Serving"
          subtitle="Find your place to make a difference"
          icon={Handshake}
          variant="watermark"
          as="h1"
          className="mb-4"
        />
        <p className="text-muted-foreground max-w-md text-sm tracking-wide md:text-base">
          There are many ways to serve. Browse opportunities and find the perfect fit for your gifts
          and schedule.
        </p>
        <button
          onClick={() => router.push(buildUrl('/serve/opportunities'))}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase transition-colors"
        >
          <Search className="h-4 w-4" />
          Find Opportunities
        </button>
      </section>
    </div>
  );
}

export default function ServePage() {
  const router = useRouter();
  const { status } = useSession();
  const { accessLevel } = useTestingContext();
  const { buildUrl } = usePreserveParams();
  const isAuthLoading = status === 'loading';
  const [loading, setLoading] = useState(true);

  const pageActions = useMemo(
    () => [
      {
        key: 'find',
        icon: Search,
        label: 'Find opportunities',
        variant: 'secondary' as const,
        onAction: () => router.push(buildUrl('/serve/opportunities')),
      },
      {
        key: 'availability',
        icon: Clock,
        label: 'Set availability',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/serve/availability')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Serve | The Hub';
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Get teams based on access level
  const myTeams =
    accessLevel === 'low'
      ? MY_TEAMS.slice(0, 1)
      : accessLevel === 'medium'
        ? MY_TEAMS.slice(0, 2)
        : MY_TEAMS;

  // Get upcoming serving based on access level
  const upcomingServing =
    accessLevel === 'low'
      ? UPCOMING_SERVING.slice(0, 2)
      : accessLevel === 'medium'
        ? UPCOMING_SERVING.slice(0, 3)
        : UPCOMING_SERVING;

  // Get apps based on access level
  const apps = accessLevel === 'low' ? SERVE_APPS.slice(0, 2) : SERVE_APPS;

  const adminApps = accessLevel === 'high' ? ADMIN_APPS : [];

  if (isAuthLoading || loading) {
    return (
      <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
        <section className="relative flex flex-col items-center">
          <SectionHeader
            title="Loading"
            subtitle="Getting your serving schedule"
            icon={Handshake}
            variant="watermark"
            as="h1"
            className="mb-8 md:mb-16"
          />
          <LogoSpinner logo={<ChurchLogo className="text-foreground" />} />
        </section>
      </div>
    );
  }

  // Show empty state for users with no teams
  if (myTeams.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Category Header */}
      <header>
        <SectionHeader
          title="Serve"
          subtitle="Your volunteer schedule and teams"
          icon={Handshake}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* My Teams Section */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Users} title="My Teams" subtitle="Teams you're part of" />
        <HorizontalScroll action="View all" onAction={() => router.push(buildUrl('/serve/teams'))}>
          {myTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onClick={() => router.push(buildUrl(`/serve/teams/${team.id}`))}
            />
          ))}
        </HorizontalScroll>
      </section>

      {/* Upcoming Serving Section */}
      {upcomingServing.length > 0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle
            icon={CalendarDays}
            title="Coming Up"
            subtitle="Your scheduled serving times"
          />
          <HorizontalScroll
            action="Full schedule"
            onAction={() => router.push(buildUrl('/serve/schedule'))}
          >
            {upcomingServing.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                day={event.day}
                date={event.date}
                time={event.time}
                type={event.status === 'pending' ? 'Pending' : 'Confirmed'}
                showWatermark={false}
                onClick={() => router.push(buildUrl(`/serve/schedule/${event.id}`))}
              />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* Open Opportunities */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Star} title="Open Opportunities" subtitle="Teams that need help" />
        <HorizontalScroll
          action="Browse all"
          onAction={() => router.push(buildUrl('/serve/opportunities'))}
        >
          {OPEN_OPPORTUNITIES.map((opp) => (
            <OpportunityCard
              key={opp.id}
              title={opp.title}
              subtitle={opp.team}
              detail={opp.date}
              secondaryDetail={opp.time}
              urgency={opp.urgency as 'high' | 'medium' | 'low'}
              onClick={() => router.push(buildUrl(`/serve/opportunities/${opp.id}`))}
            />
          ))}
        </HorizontalScroll>
      </section>

      {/* Apps Grid */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Rocket} title="Apps" subtitle="Tools for managing your serving" />
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
          <SectionTitle icon={Settings} title="Admin Tools" subtitle="Manage volunteer ministry" />
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
