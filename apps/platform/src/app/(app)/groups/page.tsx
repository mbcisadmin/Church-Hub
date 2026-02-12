'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Users, Lock, Search, Plus, Pin, MapPin, Calendar, User, Crown, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/ui/section-header';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { GroupCard } from '@church/nextjs-ui/components/GroupCard';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import ChurchLogo from '@/components/ChurchLogo';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { getPinnedGroupsForLevel, type PinnedGroup } from '@/lib/mockData';

// Extended group type with more details
interface Group {
  id: string;
  name: string;
  description?: string;
  type: string;
  members: number;
  maxMembers?: number;
  nextMeeting?: string;
  location?: string;
  campus?: string;
  leader?: string;
  isOpen: boolean;
  imageUrl?: string;
  tags?: string[];
}

// Mock groups data
const MOCK_MY_GROUPS: (PinnedGroup & { description?: string; isOpen?: boolean })[] = [
  {
    id: '1',
    name: 'Downtown Young Adults',
    role: 'Leader',
    members: 12,
    nextMeeting: 'Tomorrow 7pm',
    route: '/groups/1',
    description: 'A community for young professionals in the downtown area',
  },
  {
    id: '2',
    name: 'Marriage Builders',
    role: 'Co-Leader',
    members: 8,
    nextMeeting: 'Thursday 6:30pm',
    route: '/groups/2',
    description: 'Strengthening marriages through biblical principles',
  },
  {
    id: '3',
    name: "Men's Bible Study",
    role: 'Member',
    members: 15,
    nextMeeting: 'Saturday 8am',
    route: '/groups/3',
    description: 'Weekly study through the book of Romans',
  },
  {
    id: '4',
    name: 'Worship Team',
    role: 'Member',
    members: 24,
    nextMeeting: 'Sunday 7:30am',
    route: '/groups/4',
    description: 'Leading the church in musical worship',
  },
  {
    id: '5',
    name: 'New Parents Support',
    role: 'Host',
    members: 6,
    nextMeeting: 'Next Monday',
    route: '/groups/5',
    description: 'Support and encouragement for new parents',
  },
];

const MOCK_DISCOVER_GROUPS: Group[] = [
  {
    id: '10',
    name: 'Financial Peace',
    type: 'Study Group',
    description: 'Dave Ramsey Financial Peace University',
    members: 18,
    maxMembers: 25,
    nextMeeting: 'Starts Feb 15',
    location: 'Room 201',
    campus: 'Main',
    leader: 'Mike Thompson',
    isOpen: true,
    tags: ['Finance', 'Study'],
  },
  {
    id: '11',
    name: 'Grief Share',
    type: 'Support Group',
    description: 'A safe place to process loss and find hope',
    members: 8,
    maxMembers: 12,
    nextMeeting: 'Wednesdays 6:30pm',
    location: 'Chapel',
    campus: 'Main',
    leader: 'Susan Miller',
    isOpen: true,
    tags: ['Support', 'Recovery'],
  },
  {
    id: '12',
    name: 'Running Club',
    type: 'Interest Group',
    description: 'Weekly runs followed by coffee and conversation',
    members: 22,
    nextMeeting: 'Saturdays 7am',
    location: 'Parking Lot B',
    campus: 'Main',
    leader: 'David Chen',
    isOpen: true,
    tags: ['Fitness', 'Social'],
  },
  {
    id: '13',
    name: 'Moms Connect',
    type: 'Life Group',
    description: 'Connecting moms in every season of motherhood',
    members: 14,
    maxMembers: 16,
    nextMeeting: 'Tuesdays 9:30am',
    location: 'Kids Wing',
    campus: 'Main',
    leader: 'Emily Rodriguez',
    isOpen: true,
    tags: ['Women', 'Parenting'],
  },
  {
    id: '14',
    name: 'Photography Ministry',
    type: 'Serving Team',
    description: 'Capturing moments that matter for the church',
    members: 6,
    nextMeeting: 'As needed',
    location: 'Various',
    campus: 'All Campuses',
    leader: 'James Wilson',
    isOpen: true,
    tags: ['Creative', 'Serving'],
  },
  {
    id: '15',
    name: 'Spanish Bible Study',
    type: 'Study Group',
    description: 'Estudio bíblico en español',
    members: 20,
    nextMeeting: 'Fridays 7pm',
    location: 'Room 105',
    campus: 'Main',
    leader: 'Carlos Martinez',
    isOpen: true,
    tags: ['Spanish', 'Study'],
  },
];

function getRoleIcon(role: string) {
  switch (role) {
    case 'Leader':
      return Crown;
    case 'Co-Leader':
      return Star;
    case 'Host':
      return MapPin;
    default:
      return User;
  }
}

function MyGroupCard({
  group,
  onClick,
}: {
  group: (typeof MOCK_MY_GROUPS)[0];
  onClick: () => void;
}) {
  const RoleIcon = getRoleIcon(group.role);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card hover:bg-muted/50 relative flex h-40 w-56 flex-shrink-0 flex-col overflow-hidden rounded-xl border p-4 text-left shadow-sm transition-all hover:shadow-md"
    >
      {/* Role badge */}
      <div className="bg-primary/10 text-primary mb-2 flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
        <RoleIcon className="h-3 w-3" />
        {group.role}
      </div>

      {/* Group name */}
      <h3 className="text-foreground line-clamp-2 text-sm font-bold tracking-wide uppercase">
        {group.name}
      </h3>

      {/* Description */}
      {group.description && (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{group.description}</p>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between">
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <Users className="h-3 w-3" />
          {group.members}
        </span>
        {group.nextMeeting && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            {group.nextMeeting}
          </span>
        )}
      </div>
    </motion.button>
  );
}

function DiscoverGroupCard({ group, onClick }: { group: Group; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card hover:bg-muted/50 relative flex h-48 w-64 flex-shrink-0 flex-col overflow-hidden rounded-xl border p-4 text-left shadow-sm transition-all hover:shadow-md"
    >
      {/* Type badge */}
      <div className="bg-muted text-muted-foreground mb-2 w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold">
        {group.type}
      </div>

      {/* Group name */}
      <h3 className="text-foreground line-clamp-1 text-sm font-bold tracking-wide uppercase">
        {group.name}
      </h3>

      {/* Description */}
      {group.description && (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{group.description}</p>
      )}

      {/* Tags */}
      {group.tags && group.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {group.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary/5 text-primary/70 rounded px-1.5 py-0.5 text-[9px] font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Users className="h-3 w-3" />
            {group.members}
            {group.maxMembers && `/${group.maxMembers}`}
          </span>
          {group.isOpen && (
            <span className="text-primary text-[10px] font-semibold uppercase">Open</span>
          )}
        </div>
        {group.nextMeeting && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            {group.nextMeeting}
          </span>
        )}
      </div>
    </motion.button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
      <section className="relative flex flex-col items-center">
        <SectionHeader
          title="No Groups"
          subtitle="You're not connected to any groups yet"
          icon={Lock}
          variant="watermark"
          as="h1"
          className="mb-4"
        />
        <p className="text-muted-foreground max-w-md text-sm tracking-wide md:text-base">
          Groups are where community happens. Browse available groups or ask your leader about
          getting connected.
        </p>
      </section>
    </div>
  );
}

export default function GroupsPage() {
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
        label: 'Search groups',
        variant: 'secondary' as const,
        onAction: () => router.push(buildUrl('/groups/search')),
      },
      {
        key: 'create',
        icon: Plus,
        label: 'Create group',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/groups/new')),
      },
    ],
    [router, buildUrl]
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Groups | The Hub';
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Get groups based on access level
  const myGroups = getPinnedGroupsForLevel(accessLevel);
  const myGroupsWithDetails = MOCK_MY_GROUPS.filter((g) => myGroups.some((pg) => pg.id === g.id));

  // For low access, show fewer discover groups
  const discoverGroups =
    accessLevel === 'low'
      ? MOCK_DISCOVER_GROUPS.slice(0, 3)
      : accessLevel === 'medium'
        ? MOCK_DISCOVER_GROUPS.slice(0, 4)
        : MOCK_DISCOVER_GROUPS;

  if (isAuthLoading || loading) {
    return (
      <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
        <section className="relative flex flex-col items-center">
          <SectionHeader
            title="Loading"
            subtitle="Getting your groups ready"
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

  // Show empty state for low access with no groups
  if (accessLevel === 'low' && myGroupsWithDetails.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Category Header */}
      <header>
        <SectionHeader
          title="Groups"
          subtitle="Your communities and teams"
          icon={Users}
          variant="watermark"
          className="mb-0"
          actions={<DesktopActionBar />}
        />
      </header>

      {/* My Groups Section */}
      {myGroupsWithDetails.length > 0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle icon={Pin} title="My Groups" subtitle="Groups you're part of" />
          <HorizontalScroll action="View all" onAction={() => router.push(buildUrl('/groups/my'))}>
            {myGroupsWithDetails.map((group) => (
              <MyGroupCard
                key={group.id}
                group={group}
                onClick={() => router.push(buildUrl(group.route))}
              />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* Leading Section - only show if user leads groups */}
      {myGroupsWithDetails.filter((g) => g.role === 'Leader' || g.role === 'Co-Leader').length >
        0 && (
        <section className="flex min-w-0 flex-col">
          <SectionTitle icon={Crown} title="Leading" subtitle="Groups you lead" />
          <HorizontalScroll
            action="Leader tools"
            onAction={() => router.push(buildUrl('/groups/leader-tools'))}
          >
            {myGroupsWithDetails
              .filter((g) => g.role === 'Leader' || g.role === 'Co-Leader')
              .map((group) => (
                <GroupCard
                  key={group.id}
                  title={group.name}
                  type={group.role}
                  memberCount={group.members}
                  nextMeeting={group.nextMeeting}
                  onClick={() => router.push(buildUrl(group.route))}
                />
              ))}
          </HorizontalScroll>
        </section>
      )}

      {/* Discover Section */}
      <section className="flex min-w-0 flex-col">
        <SectionTitle icon={Search} title="Discover" subtitle="Find your community" />
        <HorizontalScroll
          action="Browse all"
          onAction={() => router.push(buildUrl('/groups/browse'))}
        >
          {discoverGroups.map((group) => (
            <DiscoverGroupCard
              key={group.id}
              group={group}
              onClick={() => router.push(buildUrl(`/groups/${group.id}`))}
            />
          ))}
        </HorizontalScroll>
      </section>

      {/* Quick Stats for leaders/admins */}
      {accessLevel !== 'low' && (
        <section className="bg-muted/30 mt-4 rounded-xl p-6">
          <h3 className="text-foreground mb-4 text-sm font-bold tracking-wide uppercase">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-foreground text-2xl font-bold">{myGroupsWithDetails.length}</p>
              <p className="text-muted-foreground text-xs uppercase">My Groups</p>
            </div>
            <div className="text-center">
              <p className="text-foreground text-2xl font-bold">
                {
                  myGroupsWithDetails.filter((g) => g.role === 'Leader' || g.role === 'Co-Leader')
                    .length
                }
              </p>
              <p className="text-muted-foreground text-xs uppercase">Leading</p>
            </div>
            <div className="text-center">
              <p className="text-foreground text-2xl font-bold">
                {myGroupsWithDetails.reduce((sum, g) => sum + g.members, 0)}
              </p>
              <p className="text-muted-foreground text-xs uppercase">Total Members</p>
            </div>
            <div className="text-center">
              <p className="text-foreground text-2xl font-bold">{discoverGroups.length}</p>
              <p className="text-muted-foreground text-xs uppercase">Open Groups</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
