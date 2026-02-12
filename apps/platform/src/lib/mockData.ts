/**
 * Mock data for testing different access levels and pinned items.
 *
 * This file centralizes all mock data used for:
 * - Home page sections
 * - Navigation pinned items
 * - Testing different permission levels
 */

// ============================================================================
// Types
// ============================================================================

export interface PinnedDashboard {
  id: string;
  label: string;
  route: string;
  stat?: string;
  statLabel?: string;
  category?: string;
}

export interface PinnedGroup {
  id: string;
  name: string;
  role: 'Leader' | 'Co-Leader' | 'Member' | 'Host';
  members: number;
  nextMeeting?: string;
  route: string;
  imageUrl?: string;
}

export interface PinnedPerson {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
  imageUrl?: string;
  route: string;
}

export interface PinnedEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  role?: string;
  route: string;
}

export interface PinnedApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
}

// ============================================================================
// Pinned Dashboards
// ============================================================================

export const PINNED_DASHBOARDS: PinnedDashboard[] = [
  {
    id: 'circles',
    label: 'Circles',
    route: '/analytics/dashboards/circles',
    stat: '24.3k',
    statLabel: 'people',
    category: 'Engagement',
  },
  {
    id: 'giving',
    label: 'Giving',
    route: '/analytics/dashboards/giving',
    stat: '$182k',
    statLabel: 'MTD',
    category: 'Finance',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    route: '/analytics/dashboards/attendance',
    stat: '1,247',
    statLabel: 'avg',
    category: 'Weekend',
  },
  {
    id: 'volunteers',
    label: 'Volunteers',
    route: '/analytics/dashboards/volunteers',
    stat: '342',
    statLabel: 'active',
    category: 'Serving',
  },
  {
    id: 'groups',
    label: 'Groups',
    route: '/analytics/dashboards/groups',
    stat: '89',
    statLabel: 'active',
    category: 'Community',
  },
];

// ============================================================================
// Pinned Groups
// ============================================================================

export const PINNED_GROUPS: PinnedGroup[] = [
  {
    id: '1',
    name: 'Downtown Young Adults',
    role: 'Leader',
    members: 12,
    nextMeeting: 'Tomorrow 7pm',
    route: '/groups/1',
  },
  {
    id: '2',
    name: 'Marriage Builders',
    role: 'Co-Leader',
    members: 8,
    nextMeeting: 'Thursday 6:30pm',
    route: '/groups/2',
  },
  {
    id: '3',
    name: "Men's Bible Study",
    role: 'Member',
    members: 15,
    nextMeeting: 'Saturday 8am',
    route: '/groups/3',
  },
  {
    id: '4',
    name: 'Worship Team',
    role: 'Member',
    members: 24,
    nextMeeting: 'Sunday 7:30am',
    route: '/groups/4',
  },
  {
    id: '5',
    name: 'New Parents Support',
    role: 'Host',
    members: 6,
    nextMeeting: 'Next Monday',
    route: '/groups/5',
  },
];

// ============================================================================
// Pinned People (Frequently Accessed Contacts)
// ============================================================================

export const PINNED_PEOPLE: PinnedPerson[] = [
  {
    id: '101',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'Small Groups Director',
    imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    route: '/people/search/101',
  },
  {
    id: '102',
    firstName: 'Michael',
    lastName: 'Chen',
    role: 'Worship Pastor',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    route: '/people/search/102',
  },
  {
    id: '103',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    role: 'Kids Ministry Lead',
    imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    route: '/people/search/103',
  },
  {
    id: '104',
    firstName: 'David',
    lastName: 'Thompson',
    role: 'Executive Pastor',
    imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
    route: '/people/search/104',
  },
  {
    id: '105',
    firstName: 'Jessica',
    lastName: 'Williams',
    role: 'Communications Director',
    imageUrl: 'https://randomuser.me/api/portraits/women/90.jpg',
    route: '/people/search/105',
  },
  {
    id: '106',
    firstName: 'James',
    lastName: 'Miller',
    role: 'Facilities Manager',
    imageUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
    route: '/people/search/106',
  },
];

// ============================================================================
// Pinned Events
// ============================================================================

export const PINNED_EVENTS: PinnedEvent[] = [
  {
    id: 'e1',
    title: 'Sunday Service',
    date: 'Every Sunday',
    time: '9:00 AM & 11:00 AM',
    location: 'Main Auditorium',
    role: 'Volunteer',
    route: '/events/sunday-service',
  },
  {
    id: 'e2',
    title: 'Leadership Summit',
    date: 'Feb 15, 2026',
    time: '9:00 AM - 3:00 PM',
    location: 'Conference Center',
    role: 'Attendee',
    route: '/events/leadership-summit',
  },
  {
    id: 'e3',
    title: 'Volunteer Appreciation',
    date: 'Feb 22, 2026',
    time: '6:00 PM',
    location: 'Fellowship Hall',
    role: 'Organizer',
    route: '/events/volunteer-appreciation',
  },
  {
    id: 'e4',
    title: 'Easter Planning Meeting',
    date: 'Feb 28, 2026',
    time: '10:00 AM',
    location: 'Room 201',
    route: '/events/easter-planning',
  },
  {
    id: 'e5',
    title: 'Youth Lock-In',
    date: 'Mar 7, 2026',
    time: '7:00 PM - 7:00 AM',
    location: 'Youth Building',
    role: 'Chaperone',
    route: '/events/youth-lock-in',
  },
];

// ============================================================================
// Apps
// ============================================================================

export const ALL_APPS: PinnedApp[] = [
  {
    id: 'people-search',
    name: 'People Search',
    description: 'Find and view contact information',
    icon: 'Search',
    route: '/people/search',
  },
  {
    id: 'check-in',
    name: 'Check-In',
    description: 'Event and service check-in',
    icon: 'UserCheck',
    route: '/apps/check-in',
  },
  {
    id: 'giving',
    name: 'Giving',
    description: 'Donation records and statements',
    icon: 'Heart',
    route: '/apps/giving',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Calendar and event management',
    icon: 'Calendar',
    route: '/events',
  },
  {
    id: 'groups',
    name: 'Groups',
    description: 'Small group management',
    icon: 'Users',
    route: '/groups',
  },
  {
    id: 'communications',
    name: 'Communications',
    description: 'Email and messaging tools',
    icon: 'Mail',
    route: '/apps/communications',
  },
  {
    id: 'volunteers',
    name: 'Volunteers',
    description: 'Volunteer scheduling and management',
    icon: 'HandHeart',
    route: '/apps/volunteers',
  },
  {
    id: 'forms',
    name: 'Forms',
    description: 'Create and manage forms',
    icon: 'ClipboardList',
    route: '/apps/forms',
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Generate custom reports',
    icon: 'FileText',
    route: '/apps/reports',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'System configuration',
    icon: 'Settings',
    route: '/settings',
  },
];

// ============================================================================
// Access Level Helpers
// ============================================================================

export type AccessLevel = 'low' | 'medium' | 'high';

/**
 * Get pinned dashboards for a given access level.
 */
export function getPinnedDashboardsForLevel(level: AccessLevel | null): PinnedDashboard[] {
  if (!level) return PINNED_DASHBOARDS;

  switch (level) {
    case 'low':
      return []; // New volunteers don't have dashboard access
    case 'medium':
      return PINNED_DASHBOARDS.slice(0, 2); // Circles, Giving
    case 'high':
      return PINNED_DASHBOARDS;
  }
}

/**
 * Get pinned groups for a given access level.
 */
export function getPinnedGroupsForLevel(level: AccessLevel | null): PinnedGroup[] {
  if (!level) return PINNED_GROUPS;

  switch (level) {
    case 'low':
      return PINNED_GROUPS.slice(0, 1); // Just their own group
    case 'medium':
      return PINNED_GROUPS.slice(0, 3);
    case 'high':
      return PINNED_GROUPS;
  }
}

/**
 * Get pinned people for a given access level.
 */
export function getPinnedPeopleForLevel(level: AccessLevel | null): PinnedPerson[] {
  if (!level) return PINNED_PEOPLE;

  switch (level) {
    case 'low':
      return PINNED_PEOPLE.slice(0, 2);
    case 'medium':
      return PINNED_PEOPLE.slice(0, 4);
    case 'high':
      return PINNED_PEOPLE;
  }
}

/**
 * Get pinned events for a given access level.
 */
export function getPinnedEventsForLevel(level: AccessLevel | null): PinnedEvent[] {
  if (!level) return PINNED_EVENTS;

  switch (level) {
    case 'low':
      return PINNED_EVENTS.filter((e) => e.role === 'Volunteer' || e.role === 'Attendee').slice(
        0,
        2
      );
    case 'medium':
      return PINNED_EVENTS.slice(0, 3);
    case 'high':
      return PINNED_EVENTS;
  }
}

/**
 * Get apps for a given access level.
 */
export function getAppsForLevel(level: AccessLevel | null): PinnedApp[] {
  if (!level) return ALL_APPS;

  switch (level) {
    case 'low':
      return ALL_APPS.filter((a) => ['people-search', 'check-in'].includes(a.id));
    case 'medium':
      return ALL_APPS.filter((a) =>
        ['people-search', 'check-in', 'giving', 'events', 'groups', 'communications'].includes(a.id)
      );
    case 'high':
      return ALL_APPS;
  }
}

// ============================================================================
// Navigation Mock Data
// ============================================================================

/**
 * Dynamic section IDs that appear in navigation.
 * These are filtered based on access level.
 */
export const DYNAMIC_SECTION_IDS = [
  'analytics',
  'announcements',
  'church',
  'discipleship',
  'facilities',
  'finance',
  'prayer',
  'staff',
] as const;

export type DynamicSectionId = (typeof DYNAMIC_SECTION_IDS)[number];

/**
 * Get which dynamic sections should be visible for a given access level.
 * Returns an array of section IDs that should be shown.
 *
 * - low: Prayer, Discipleship (personal growth focused)
 * - medium: Add Announcements, Church, Finance
 * - high: All sections including Facilities, Staff, Analytics
 */
export function getDynamicSectionsForLevel(level: AccessLevel | null): DynamicSectionId[] {
  if (!level) return [...DYNAMIC_SECTION_IDS]; // No filtering when no level set

  switch (level) {
    case 'low':
      // New volunteers: just personal growth and prayer
      return ['discipleship', 'prayer'];
    case 'medium':
      // Regular staff: most sections except admin-only
      return ['announcements', 'church', 'discipleship', 'finance', 'prayer'];
    case 'high':
      // Admin/leadership: all sections
      return [...DYNAMIC_SECTION_IDS];
  }
}

/**
 * Get pinned items for navigation based on access level.
 * Returns items that should appear nested under their parent category.
 */
export function getNavPinnedItems(level: AccessLevel | null) {
  return {
    dashboards: getPinnedDashboardsForLevel(level).map((d) => ({
      label: d.label,
      route: d.route,
    })),
    groups: getPinnedGroupsForLevel(level)
      .filter((g) => g.role === 'Leader' || g.role === 'Co-Leader')
      .map((g) => ({
        label: g.name,
        route: g.route,
      })),
    /** Individual nav items the user has pinned (shown with pin icon, used for pin filter). */
    items: [
      { label: 'Quick Facts', route: '/analytics/quick-facts' },
      { label: 'Counter', route: '/events/counter' },
      { label: 'Search', route: '/people/search' },
    ],
  };
}
