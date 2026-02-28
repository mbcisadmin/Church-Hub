'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Filter,
  Loader2,
  BarChart3,
  Rocket,
  Home,
  Heart,
  HandCoins,
  Users,
  UserCircle,
  Calendar,
  CalendarDays,
  CalendarPlus,
  CalendarSearch,
  ClipboardList,
  AlertTriangle,
  UsersRound,
  UserPlus,
  Handshake,
  HandHeart,
  MessageSquareHeart,
  PiggyBank,
  Megaphone,
  Plus,
  Contact,
  User,
  HomeIcon,
  Footprints,
  Wallet,
  Church,
  Briefcase,
  Building2,
  Ticket,
  Pin,
} from 'lucide-react';
import { Icon } from '@/lib/icons';
import { ScrollIndicator } from '@church/nextjs-ui/components/ScrollIndicator';
import ChurchLogo from '@/components/ChurchLogo';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { getNavPinnedItems, getDynamicSectionsForLevel } from '@/lib/mockData';
import { usePreserveParams } from '@/lib/usePreserveParams';

interface NavApp {
  id: number;
  name: string;
  key: string;
  description: string | null;
  route: string;
  icon: string;
  type: 'app' | 'dashboard';
}

// Primary sections (alphabetized)
const PRIMARY_SECTIONS = [
  {
    id: 'events',
    label: 'Events',
    icon: CalendarDays,
    basePath: '/events',
    items: [
      { label: 'Calendar', route: '/events/calendar' },
      { label: 'Cancellations', route: '/events/cancellations' },
      { label: 'Counter', route: '/events/counter' },
      { label: 'Finder', route: '/events/finder' },
      { label: 'Registration', route: '/events/registration' },
      { label: 'Ticketed', route: '/events/ticketed' },
    ],
    addAction: { label: 'New', route: '/events/new' },
  },
  {
    id: 'giving',
    label: 'Giving',
    icon: HandCoins,
    basePath: '/giving',
    items: [{ label: 'Overview', route: '/giving' }],
    addAction: { label: 'Give Now', route: '/giving/new' },
  },
  {
    id: 'groups',
    label: 'Groups',
    icon: UsersRound,
    basePath: '/groups',
    items: [
      { label: 'All', route: '/groups' },
      { label: 'Find', route: '/groups/finder' },
    ],
    addAction: { label: 'New', route: '/groups/add' },
  },
  {
    id: 'people',
    label: 'People',
    icon: Contact,
    basePath: '/people',
    items: [
      { label: 'Directory', route: '/people/directory' },
      { label: 'Search', route: '/people/search' },
    ],
    addAction: { label: 'New', route: '/people/add' },
  },
  {
    id: 'serve',
    label: 'Serve',
    icon: Handshake,
    basePath: '/serve',
    items: [{ label: 'Opportunities', route: '/serve' }],
    addAction: { label: 'New', route: '/serve/add' },
  },
];

// Dynamic sections (alphabetized)
// addAction: optional "Add" button shown at bottom of section (could be internal or external URL in Neon)
const DYNAMIC_SECTIONS = [
  {
    id: 'announcements',
    label: 'Announcements',
    icon: Megaphone,
    basePath: '/announcements',
    items: [
      { label: 'All', route: '/announcements' },
      { label: 'Mine', route: '/announcements/my' },
      { label: 'View', route: '/announcements/view' },
      { label: 'Widget', route: '/announcements/widget' },
    ],
    addAction: { label: 'New', route: '/announcements/create' },
  },
  {
    id: 'church',
    label: 'Church',
    icon: Church,
    basePath: '/church',
    items: [
      { label: 'Care Teams', route: '/church/care-teams' },
      { label: 'Directory', route: '/church/directory' },
      { label: 'Overview', route: '/church' },
      { label: 'Volunteers', route: '/church/volunteers' },
    ],
  },
  {
    id: 'facilities',
    label: 'Facilities',
    icon: Building2,
    basePath: '/facilities',
    items: [
      { label: 'Campus Map', route: '/facilities/map' },
      { label: 'Equipment', route: '/facilities/equipment' },
      { label: 'Room Manager', route: '/facilities/room-manager' },
      { label: 'Room Reservations', route: '/facilities/rooms' },
    ],
    addAction: { label: 'Reserve', route: '/facilities/reserve' },
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Wallet,
    basePath: '/finance',
    items: [
      { label: 'Budget Requests', route: '/finance/budget-requests' },
      { label: 'Invoices', route: '/finance/invoices' },
      { label: 'Overview', route: '/finance' },
      { label: 'P-Card', route: '/finance/p-card' },
      { label: 'Reports', route: '/finance/reports' },
    ],
    addAction: { label: 'Request', route: '/finance/request' },
  },
  {
    id: 'discipleship',
    label: 'Discipleship',
    icon: Heart,
    basePath: '/discipleship',
    items: [
      { label: 'Baptism', route: '/discipleship/baptism' },
      { label: 'Classes', route: '/discipleship/classes' },
      { label: 'Growth Track', route: '/discipleship/growth-track' },
      { label: 'Membership', route: '/discipleship/membership' },
      { label: 'My Journey', route: '/discipleship/my-journey' },
    ],
    addAction: { label: 'New Journey', route: '/discipleship/new' },
  },
  {
    id: 'prayer',
    label: 'Prayer',
    icon: HandHeart,
    basePath: '/prayer',
    items: [
      { label: 'All Requests', route: '/prayer' },
      { label: 'My Requests', route: '/prayer/my-requests' },
      { label: 'Praying For', route: '/prayer/praying-for' },
    ],
    addAction: { label: 'New', route: '/prayer/submit' },
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: Briefcase,
    basePath: '/staff',
    items: [
      { label: 'Directory', route: '/staff' },
      { label: 'HR Portal', route: '/staff/hr' },
      { label: 'Resources', route: '/staff/resources' },
      { label: 'Training', route: '/staff/training' },
    ],
    addAction: { label: 'New', route: '/staff/add' },
  },
];

// All sections combined for path matching
const ALL_SECTIONS = [...PRIMARY_SECTIONS, ...DYNAMIC_SECTIONS];

// Use rem values so nav scales with root font size on large screens
const COLLAPSED_WIDTH = '3.5rem'; // 56px at 16px base
const EXPANDED_WIDTH = '17.5rem'; // 280px at 16px base

export default function NavigationRail() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isPWAMode, accessLevel } = useTestingContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dashboards, setDashboards] = useState<NavApp[]>([]);
  const [apps, setApps] = useState<NavApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [navFilter, setNavFilter] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);

  // Filter sections by label, item labels, or pinned item labels
  const filterSections = <
    T extends {
      label: string;
      items?: Array<{ label: string }>;
      pinnedItems?: Array<{ label: string }>;
    },
  >(
    sections: T[]
  ): T[] => {
    if (!navFilter.trim()) return sections;
    const q = navFilter.toLowerCase();
    return sections
      .map((section) => {
        if (section.label.toLowerCase().includes(q)) return section;
        const matchingItems = section.items?.filter((item) => item.label.toLowerCase().includes(q));
        const matchingPinned = section.pinnedItems?.filter((item) =>
          item.label.toLowerCase().includes(q)
        );
        const hasItems = matchingItems && matchingItems.length > 0;
        const hasPinned = matchingPinned && matchingPinned.length > 0;
        if (hasItems || hasPinned) {
          // When pinned items match, keep the "Dashboards" parent item so pinned items render under it
          let finalItems = hasItems ? matchingItems : [];
          if (hasPinned && section.items) {
            const dashboardsItem = section.items.find((item) => item.label === 'Dashboards');
            if (dashboardsItem && !finalItems!.some((item) => item.label === 'Dashboards')) {
              finalItems = [dashboardsItem, ...(finalItems || [])];
            }
          }
          return {
            ...section,
            ...(section.items ? { items: finalItems } : {}),
            ...(section.pinnedItems ? { pinnedItems: hasPinned ? matchingPinned : [] } : {}),
          };
        }
        return null;
      })
      .filter(Boolean) as T[];
  };

  // Get pinned items based on access level
  const navPinnedItems = getNavPinnedItems(accessLevel);

  // Set of top-level item routes that are pinned (for filtering when pinnedOnly)
  const pinnedTopLevelRoutes = new Set((navPinnedItems.items || []).map((i) => i.route));

  // Get which dynamic sections to show based on access level
  const visibleDynamicSections = getDynamicSectionsForLevel(accessLevel);

  // Preserve query params when navigating
  const { buildUrl } = usePreserveParams();

  // Hide navigation rail in PWA mode (bottom tabs are used instead)
  if (isPWAMode) {
    return null;
  }

  // Determine which section is active based on current path
  const getActiveSectionId = useCallback((path: string): string | null => {
    // Check Me section
    if (path.startsWith('/me')) {
      return 'me';
    }
    // Check Analytics (dashboards)
    if (path.startsWith('/analytics')) {
      return 'analytics';
    }
    // Check Apps (other apps besides people-search)
    if (path.startsWith('/apps')) {
      return 'apps';
    }
    // Check all defined sections
    const activeSection = ALL_SECTIONS.find((s) => path.startsWith(s.basePath));
    if (activeSection) {
      return activeSection.id;
    }
    return null;
  }, []);

  // Initialize with only the active section expanded (all others collapsed)
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const activeSection = getActiveSectionId(pathname);
    // Only expand the active section, everything else collapsed
    return activeSection ? [activeSection] : [];
  });

  // Reset to only the active section when rail expands
  useEffect(() => {
    if (isExpanded) {
      const activeSection = getActiveSectionId(pathname);
      setExpandedSections(activeSection ? [activeSection] : []);
    }
  }, [isExpanded]);

  // Fetch apps on mount
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const [dashboardRes, appRes] = await Promise.all([
          fetch('/api/permissions/apps?type=dashboard'),
          fetch('/api/permissions/apps?type=app'),
        ]);

        if (dashboardRes.ok) {
          const data = await dashboardRes.json();
          setDashboards(data.apps || []);
        }

        if (appRes.ok) {
          const data = await appRes.json();
          setApps(data.apps || []);
        }
      } catch (error) {
        console.error('Error fetching navigation apps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, []);

  // Auto-expand section if user is in that path
  useEffect(() => {
    const activeSectionId = getActiveSectionId(pathname);
    if (activeSectionId && !expandedSections.includes(activeSectionId)) {
      setExpandedSections((prev) => [...prev, activeSectionId]);
    }
  }, [pathname, getActiveSectionId]);

  const handleNavigate = useCallback(
    (route: string) => {
      if (route.startsWith('http://') || route.startsWith('https://')) {
        window.open(route, '_blank', 'noopener,noreferrer');
      } else {
        router.push(buildUrl(route));
      }
      setIsExpanded(false);
    },
    [router, buildUrl]
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => (prev.includes(sectionId) ? [] : [sectionId]));
  };

  const isActiveRoute = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname === route || pathname.startsWith(route + '/');
  };

  // Determine which main area we're in (for dynamic sections)
  const isInDashboards = pathname.startsWith('/analytics');
  const isInApps = pathname.startsWith('/apps');

  return (
    <>
      {/* Backdrop when expanded - only show on screens smaller than 2xl */}
      {isExpanded && (
        <div
          className="fixed inset-0 top-14 z-30 hidden bg-black/50 md:block 2xl:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
        transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
        className="bg-secondary hidden flex-col [grid-area:nav] md:z-40 md:flex 2xl:z-auto"
      >
        {/* Collapse/Expand button at top */}
        <div className="px-2 pt-3 pb-2">
          <button
            onClick={() => {
              if (isExpanded) setNavFilter('');
              setIsExpanded(!isExpanded);
            }}
            className={`group flex h-8 w-full items-center gap-2 text-white/70 transition-colors hover:text-white ${
              isExpanded ? 'px-2' : 'justify-center'
            }`}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="group-hover:text-primary h-4 w-4 shrink-0 transition-colors duration-300" />
                <span className="group-hover:text-primary text-xs font-medium transition-colors duration-300">
                  Close
                </span>
              </>
            ) : (
              <ChevronRight className="group-hover:text-primary h-5 w-5 transition-colors duration-300" />
            )}
          </button>
        </div>

        {/* Navigation content */}
        <div className="relative flex-1">
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide absolute inset-0 overflow-x-hidden overflow-y-auto px-2 pt-1 pb-4"
          >
            {/* Filter input (expanded only) — inside scroll container for alignment */}
            {isExpanded && (
              <div className="relative mb-4">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                  <Filter className="h-3.5 w-3.5 text-white/30" />
                </div>
                <input
                  type="text"
                  value={navFilter}
                  onChange={(e) => setNavFilter(e.target.value)}
                  placeholder="Filter..."
                  className="h-8 w-full border border-white/10 bg-white/5 pr-8 pl-8 text-xs text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
                />
                {navFilter && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button
                      onClick={() => setNavFilter('')}
                      className="text-white/30 hover:text-white/60"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              </div>
            ) : isExpanded ? (
              /* EXPANDED: Show full navigation with sections */
              <nav className="space-y-4">
                {/* Primary Sections (filtered to pinned items when pin filter active) */}
                {(() => {
                  let primaryList = filterSections(PRIMARY_SECTIONS) as typeof PRIMARY_SECTIONS;
                  if (pinnedOnly) {
                    primaryList = primaryList
                      .map((section) => {
                        const filteredItems = section.items.filter((item) =>
                          pinnedTopLevelRoutes.has(item.route)
                        );
                        if (filteredItems.length === 0) return null;
                        return { ...section, items: filteredItems };
                      })
                      .filter(Boolean) as typeof PRIMARY_SECTIONS;
                  }
                  return primaryList.map((section) => {
                    const isActive = pathname.startsWith(section.basePath);
                    const isOpen =
                      navFilter.trim() || pinnedOnly ? true : expandedSections.includes(section.id);
                    const SectionIcon = section.icon;

                    return (
                      <div key={section.id}>
                        <div
                          className={`mb-2 flex w-full items-center gap-2 px-2 text-xs font-semibold tracking-wider uppercase ${isActive ? 'text-primary' : 'text-white/40'}`}
                        >
                          <button
                            onClick={() => handleNavigate(section.basePath)}
                            className="hover:text-primary flex flex-1 items-center gap-2 transition-colors"
                          >
                            <SectionIcon className="h-3 w-3" />
                            <span className="flex-1 text-left">{section.label}</span>
                          </button>
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="hover:text-primary -mr-1 p-2 transition-colors"
                            aria-label={
                              isOpen ? `Collapse ${section.label}` : `Expand ${section.label}`
                            }
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <ul className="space-y-0.5">
                                {section.items.map((item) => (
                                  <li key={item.route}>
                                    <SubNavItem
                                      label={item.label}
                                      isActive={isActiveRoute(item.route)}
                                      onClick={() => handleNavigate(item.route)}
                                      isPinned={pinnedTopLevelRoutes.has(item.route)}
                                    />
                                  </li>
                                ))}
                              </ul>
                              {!pinnedOnly && section.addAction && (
                                <AddActionButton
                                  label={section.addAction.label}
                                  onClick={() => handleNavigate(section.addAction!.route)}
                                />
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  });
                })()}

                {/* Dynamic Sections - sorted with active first, then alphabetical, filtered by access level */}
                {(() => {
                  // Build list of all dynamic sections (API + static)
                  const dynamicList: Array<{
                    id: string;
                    label: string;
                    icon: typeof BarChart3;
                    basePath: string;
                    items?: Array<{ label: string; route: string }>;
                    pinnedItems?: Array<{ label: string; route: string }>;
                    apiItems?: NavApp[];
                    isApiSection?: boolean;
                    addAction?: { label: string; route: string };
                  }> = [];

                  // Add Analytics section (only show if user has access to dashboards AND access level allows)
                  // Individual dashboards don't show here - only pinned ones do
                  // Pinned items come from access level (will be user preferences from Neon)
                  if (dashboards.length > 0 && visibleDynamicSections.includes('analytics')) {
                    dynamicList.push({
                      id: 'analytics',
                      label: 'Analytics',
                      icon: BarChart3,
                      basePath: '/analytics',
                      items: [
                        { label: 'Dashboards', route: '/analytics/dashboards' },
                        { label: 'Exports', route: '/analytics/exports' },
                        { label: 'Goals', route: '/analytics/goals' },
                        { label: 'Google', route: 'https://analytics.google.com' },
                        { label: 'Quick Facts', route: '/analytics/quick-facts' },
                        { label: 'Reports', route: '/analytics/reports' },
                        { label: 'Snapshots', route: '/analytics/snapshots' },
                        { label: 'Trends', route: '/analytics/trends' },
                      ],
                      pinnedItems: navPinnedItems.dashboards,
                      addAction: { label: 'New', route: '/analytics/request' },
                    });
                  }

                  // Add static dynamic sections (filtered by access level)
                  DYNAMIC_SECTIONS.filter((s) =>
                    visibleDynamicSections.includes(s.id as any)
                  ).forEach((s) => dynamicList.push(s));

                  // Sort: active section first, then alphabetically
                  const activeDynamicId = getActiveSectionId(pathname);
                  dynamicList.sort((a, b) => {
                    // Active section goes first
                    if (a.id === activeDynamicId) return -1;
                    if (b.id === activeDynamicId) return 1;
                    // Then alphabetical
                    return a.label.localeCompare(b.label);
                  });

                  let filteredDynamic: typeof dynamicList;
                  if (pinnedOnly) {
                    filteredDynamic = dynamicList
                      .map((section) => {
                        const hasPinnedNested =
                          section.pinnedItems && section.pinnedItems.length > 0;
                        const hasPinnedTopLevel = section.items?.some((item) =>
                          pinnedTopLevelRoutes.has(item.route)
                        );
                        if (!hasPinnedNested && !hasPinnedTopLevel) return null;
                        // Filter items to only parents of nested pinned items + pinned top-level items
                        const filteredItems = section.items?.filter((item) => {
                          if (item.label === 'Dashboards' && hasPinnedNested) return true;
                          if (pinnedTopLevelRoutes.has(item.route)) return true;
                          return false;
                        });
                        return { ...section, items: filteredItems || [] };
                      })
                      .filter(Boolean) as typeof dynamicList;
                    filteredDynamic = filterSections(filteredDynamic);
                  } else {
                    filteredDynamic = filterSections(dynamicList);
                  }
                  // Check if primary sections have visible content (for separator logic)
                  const hasPrimarySections = pinnedOnly
                    ? PRIMARY_SECTIONS.some((s) =>
                        s.items.some((item) => pinnedTopLevelRoutes.has(item.route))
                      )
                    : filterSections(PRIMARY_SECTIONS).length > 0;

                  return (
                    <>
                      {/* Separator - hide if either group is fully filtered out */}
                      {hasPrimarySections && filteredDynamic.length > 0 && (
                        <div className="mx-2 my-5 border-t border-white/10" />
                      )}
                      {!hasPrimarySections && filteredDynamic.length === 0 && (
                        <p className="px-2 text-xs text-white/40">No results</p>
                      )}
                      {filteredDynamic.map((section) => {
                        const isActive =
                          section.id === 'analytics'
                            ? isInDashboards
                            : section.id === 'apps'
                              ? isInApps
                              : pathname.startsWith(section.basePath);
                        const isOpen =
                          navFilter.trim() || pinnedOnly
                            ? true
                            : expandedSections.includes(section.id);
                        const SectionIcon = section.icon;

                        return (
                          <div key={section.id}>
                            <div
                              className={`mb-2 flex w-full items-center gap-2 px-2 text-xs font-semibold tracking-wider uppercase ${isActive ? 'text-primary' : 'text-white/40'}`}
                            >
                              {/* Icon + Label - navigates to section */}
                              <button
                                onClick={() => handleNavigate(section.basePath)}
                                className="hover:text-primary flex flex-1 items-center gap-2 transition-colors"
                              >
                                <SectionIcon className="h-3 w-3" />
                                <span className="flex-1 text-left">{section.label}</span>
                              </button>
                              {/* Chevron - toggles section */}
                              <button
                                onClick={() => toggleSection(section.id)}
                                className="hover:text-primary -mr-1 p-2 transition-colors"
                                aria-label={
                                  isOpen ? `Collapse ${section.label}` : `Expand ${section.label}`
                                }
                              >
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                />
                              </button>
                            </div>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <ul className="space-y-0.5">
                                    {/* Static items first (if any) */}
                                    {section.items?.map((item) => (
                                      <li key={item.route}>
                                        <SubNavItem
                                          label={item.label}
                                          isActive={isActiveRoute(item.route)}
                                          onClick={() => handleNavigate(item.route)}
                                          isPinned={pinnedTopLevelRoutes.has(item.route)}
                                        />
                                        {/* Render pinned items nested under Dashboards */}
                                        {item.label === 'Dashboards' &&
                                          section.pinnedItems &&
                                          section.pinnedItems.length > 0 && (
                                            <ul className="mt-0.5 space-y-0.5">
                                              {section.pinnedItems.map((pinned) => (
                                                <li key={pinned.route}>
                                                  <SubNavItem
                                                    label={pinned.label}
                                                    isActive={isActiveRoute(pinned.route)}
                                                    onClick={() => handleNavigate(pinned.route)}
                                                    isPinned
                                                    isNested
                                                  />
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                      </li>
                                    ))}
                                    {/* API items (if any) */}
                                    {section.isApiSection &&
                                      section.apiItems?.map((item) => (
                                        <li key={item.id}>
                                          <SubNavItem
                                            label={item.name}
                                            isActive={isActiveRoute(item.route)}
                                            onClick={() => handleNavigate(item.route)}
                                          />
                                        </li>
                                      ))}
                                  </ul>
                                  {section.addAction && (
                                    <AddActionButton
                                      label={section.addAction.label}
                                      onClick={() => handleNavigate(section.addAction!.route)}
                                    />
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </nav>
            ) : (
              /* COLLAPSED: Show all section icons */
              <nav className="space-y-1">
                {/* Primary sections (filtered to those with pinned items when pin filter active) */}
                {(pinnedOnly
                  ? PRIMARY_SECTIONS.filter((s) =>
                      s.items.some((item) => pinnedTopLevelRoutes.has(item.route))
                    )
                  : PRIMARY_SECTIONS
                ).map((section) => {
                  const isActive =
                    section.id === 'me'
                      ? pathname.startsWith('/me')
                      : pathname.startsWith(section.basePath);
                  const SectionIcon = section.icon;
                  return (
                    <NavItem
                      key={section.id}
                      icon={<SectionIcon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />}
                      label={section.label}
                      isActive={isActive}
                      isExpanded={false}
                      onClick={() => handleNavigate(section.basePath)}
                    />
                  );
                })}
                {/* Separator before dynamic sections */}
                <div className="mx-2 my-3 border-t border-white/10" />
                {/* Dynamic sections - alphabetized with active first, filtered by access level */}
                {(() => {
                  const dynamicList: Array<{
                    id: string;
                    label: string;
                    icon: typeof BarChart3;
                    basePath: string;
                  }> = [];

                  if (dashboards.length > 0 && visibleDynamicSections.includes('analytics')) {
                    dynamicList.push({
                      id: 'analytics',
                      label: 'Analytics',
                      icon: BarChart3,
                      basePath: '/analytics',
                    });
                  }
                  DYNAMIC_SECTIONS.filter((s) =>
                    visibleDynamicSections.includes(s.id as any)
                  ).forEach((s) =>
                    dynamicList.push({
                      id: s.id,
                      label: s.label,
                      icon: s.icon,
                      basePath: s.basePath,
                    })
                  );

                  const activeDynamicId = getActiveSectionId(pathname);
                  dynamicList.sort((a, b) => {
                    if (a.id === activeDynamicId) return -1;
                    if (b.id === activeDynamicId) return 1;
                    return a.label.localeCompare(b.label);
                  });

                  // When pinnedOnly, only show sections with pinned content
                  const visibleList = pinnedOnly
                    ? dynamicList.filter((s) => s.id === 'analytics')
                    : dynamicList;

                  return visibleList.map((section) => {
                    const isActive =
                      section.id === 'analytics'
                        ? isInDashboards
                        : section.id === 'apps'
                          ? isInApps
                          : pathname.startsWith(section.basePath);
                    const SectionIcon = section.icon;
                    return (
                      <NavItem
                        key={section.id}
                        icon={
                          <SectionIcon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                        }
                        label={section.label}
                        isActive={isActive}
                        isExpanded={false}
                        onClick={() => handleNavigate(section.basePath)}
                      />
                    );
                  });
                })()}
              </nav>
            )}
          </div>
          <ScrollIndicator
            containerRef={scrollContainerRef}
            variant="dark"
            gradientClass="bg-gradient-to-t from-secondary to-transparent"
            active={true}
            condensed={!isExpanded}
            className="!right-0"
          />
        </div>

        {/* Bottom section — pin filter toggle (always vertical, stays in place when nav expands) */}
        <div
          className="flex justify-center p-2"
          style={{ width: COLLAPSED_WIDTH, transition: 'none' }}
        >
          <button
            onClick={() => setPinnedOnly((v) => !v)}
            className="group flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            aria-label={pinnedOnly ? 'Show all items' : 'Show pinned only'}
            title={pinnedOnly ? 'Show all items' : 'Show pinned only'}
          >
            <Pin
              className={`h-4 w-4 transition-colors ${pinnedOnly ? 'text-primary' : 'text-white/30 group-hover:text-white/70'}`}
            />
          </button>
        </div>
      </motion.aside>
    </>
  );
}

// NavItem component
function NavItem({
  icon,
  label,
  isActive,
  isExpanded,
  onClick,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  const baseClasses = 'group relative flex w-full items-center gap-2.5 rounded-md px-1 py-0.5';
  const variantClasses = {
    default: isActive ? 'text-white' : 'text-white/70',
    danger: 'text-red-400',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${!isExpanded ? 'justify-center px-0' : ''}`}
      title={!isExpanded ? label : undefined}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
          variant === 'danger' ? '' : isActive ? 'bg-white/10' : 'group-hover:bg-white/10'
        }`}
      >
        <span
          className={`transition-colors duration-300 [&>svg]:h-4 [&>svg]:w-4 ${
            variant === 'danger' ? 'group-hover:text-red-300' : 'group-hover:text-primary'
          }`}
        >
          {icon}
        </span>
      </div>

      {isExpanded && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex-1 truncate text-left text-xs font-medium transition-colors duration-300 ${
            variant === 'danger' ? 'group-hover:text-red-300' : 'group-hover:text-primary'
          }`}
        >
          {label}
        </motion.span>
      )}
    </button>
  );
}

// SubNavItem - compact text-only item for section children
function SubNavItem({
  label,
  isActive,
  onClick,
  isPinned,
  isNested,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  isPinned?: boolean;
  isNested?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-1.5 rounded-md py-0.5 pr-2 text-left text-xs font-medium tracking-wide uppercase transition-colors ${
        isNested ? 'pl-8' : 'pl-5'
      } ${isActive ? 'text-white' : 'hover:text-primary text-white/50'}`}
    >
      {isPinned && <Pin className="h-2.5 w-2.5 shrink-0" />}
      <span>{label}</span>
    </button>
  );
}

// AddActionButton - special styled button for "Add" / "Create" actions at bottom of section
function AddActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-primary/70 hover:text-primary mt-1 flex w-full items-center gap-1.5 rounded-md py-0.5 pr-2 pl-5 text-left text-xs font-medium tracking-wide transition-colors"
    >
      <Plus className="h-3 w-3" />
      <span>{label}</span>
    </button>
  );
}
