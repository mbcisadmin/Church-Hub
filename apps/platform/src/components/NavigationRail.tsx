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
  HandCoins,
  CalendarDays,
  UsersRound,
  Handshake,
  Plus,
  Contact,
  Pin,
  Hash,
  DoorOpen,
  Search,
  PieChart,
  Calendar,
  Users,
  Heart,
  type LucideIcon,
} from 'lucide-react';
import { ScrollIndicator } from '@church/nextjs-ui/components/ScrollIndicator';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';

// Map icon name strings from DB to lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  'bar-chart-3': BarChart3,
  'hand-coins': HandCoins,
  'calendar-days': CalendarDays,
  'users-round': UsersRound,
  handshake: Handshake,
  contact: Contact,
  hash: Hash,
  'door-open': DoorOpen,
  search: Search,
  'pie-chart': PieChart,
  calendar: Calendar,
  users: Users,
  heart: Heart,
};

function resolveIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return BarChart3;
  return ICON_MAP[iconName] || BarChart3;
}

interface NavCategory {
  id: number;
  name: string;
  key: string;
  icon: string | null;
  route: string | null;
  addActionUrl: string | null;
  addActionLabel: string | null;
  apps: NavApp[];
}

interface NavApp {
  id: number;
  name: string;
  key: string;
  route: string;
  icon: string | null;
}

// Use rem values so nav scales with root font size on large screens
const COLLAPSED_WIDTH = '3.5rem'; // 56px at 16px base
const EXPANDED_WIDTH = '17.5rem'; // 280px at 16px base

export default function NavigationRail() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isPWAMode } = useTestingContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [navCategories, setNavCategories] = useState<NavCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [navFilter, setNavFilter] = useState('');

  // Preserve query params when navigating
  const { buildUrl } = usePreserveParams();

  // Hide navigation rail in PWA mode (bottom tabs are used instead)
  if (isPWAMode) {
    return null;
  }

  // Fetch nav data on mount
  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await fetch('/api/nav');
        if (res.ok) {
          const data = await res.json();
          setNavCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching navigation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNav();
  }, []);

  // Determine which section is active based on current path
  const getActiveSectionKey = useCallback(
    (path: string): string | null => {
      if (path.startsWith('/me')) return 'me';
      // Find the category whose route or apps match the path
      for (const cat of navCategories) {
        // Check if any app route matches
        for (const app of cat.apps) {
          if (path.startsWith(app.route)) return cat.key;
        }
        // Check if category route matches (only internal routes)
        if (cat.route && !cat.route.startsWith('http') && path.startsWith(cat.route)) {
          return cat.key;
        }
      }
      return null;
    },
    [navCategories]
  );

  // Initialize with only the active section expanded
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Set initial expanded section once nav data loads
  useEffect(() => {
    if (navCategories.length > 0) {
      const activeSection = getActiveSectionKey(pathname);
      setExpandedSections(activeSection ? [activeSection] : []);
    }
  }, [navCategories.length]);

  // Reset to only the active section when rail expands
  useEffect(() => {
    if (isExpanded) {
      const activeSection = getActiveSectionKey(pathname);
      setExpandedSections(activeSection ? [activeSection] : []);
    }
  }, [isExpanded]);

  // Auto-expand section if user is in that path
  useEffect(() => {
    const activeKey = getActiveSectionKey(pathname);
    if (activeKey && !expandedSections.includes(activeKey)) {
      setExpandedSections((prev) => [...prev, activeKey]);
    }
  }, [pathname, getActiveSectionKey]);

  const handleNavigate = useCallback(
    (route: string, trackLabel?: string) => {
      // Track external link clicks so they show in recents
      if (trackLabel) {
        fetch('/api/search/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resultType: 'app',
            resultId: route,
            resultTitle: trackLabel,
            resultRoute: route,
          }),
        }).catch(() => {});
      }

      if (route.startsWith('http://') || route.startsWith('https://')) {
        window.open(route, '_blank', 'noopener,noreferrer');
      } else {
        router.push(buildUrl(route));
      }
      setIsExpanded(false);
    },
    [router, buildUrl]
  );

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => (prev.includes(sectionKey) ? [] : [sectionKey]));
  };

  const isActiveRoute = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname === route || pathname.startsWith(route + '/');
  };

  // Filter categories by search
  const filteredCategories = navFilter.trim()
    ? (navCategories
        .map((cat) => {
          const q = navFilter.toLowerCase();
          if (cat.name.toLowerCase().includes(q)) return cat;
          const matchingApps = cat.apps.filter((app) => app.name.toLowerCase().includes(q));
          if (matchingApps.length > 0) return { ...cat, apps: matchingApps };
          return null;
        })
        .filter(Boolean) as NavCategory[])
    : navCategories;

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
            {/* Filter input (expanded only) */}
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
                {filteredCategories.map((cat) => {
                  const isActive =
                    cat.route && !cat.route.startsWith('http')
                      ? pathname.startsWith(cat.route)
                      : cat.apps.some((app) => pathname.startsWith(app.route));
                  const isOpen = navFilter.trim() ? true : expandedSections.includes(cat.key);
                  const SectionIcon = resolveIcon(cat.icon);

                  return (
                    <div key={cat.key}>
                      <div
                        className={`mb-2 flex w-full items-center gap-2 px-2 text-xs font-semibold tracking-wider uppercase ${isActive ? 'text-primary' : 'text-white/40'}`}
                      >
                        <button
                          onClick={() =>
                            cat.route
                              ? handleNavigate(
                                  cat.route,
                                  cat.route.startsWith('http') ? cat.name : undefined
                                )
                              : toggleSection(cat.key)
                          }
                          className="hover:text-primary flex flex-1 items-center gap-2 transition-colors"
                        >
                          <SectionIcon className="h-3 w-3" />
                          <span className="flex-1 text-left">{cat.name}</span>
                        </button>
                        {(cat.apps.length > 0 || cat.addActionUrl) && (
                          <button
                            onClick={() => toggleSection(cat.key)}
                            className="hover:text-primary -mr-1 p-2 transition-colors"
                            aria-label={isOpen ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}
                      </div>
                      <AnimatePresence>
                        {isOpen && (cat.apps.length > 0 || cat.addActionUrl) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <ul className="space-y-0.5">
                              {cat.apps.map((app) => (
                                <li key={app.key}>
                                  <SubNavItem
                                    label={app.name}
                                    isActive={isActiveRoute(app.route)}
                                    onClick={() => handleNavigate(app.route)}
                                  />
                                </li>
                              ))}
                            </ul>
                            {cat.addActionUrl && (
                              <AddActionButton
                                label={cat.addActionLabel || 'New'}
                                onClick={() => handleNavigate(cat.addActionUrl!, `New ${cat.name}`)}
                              />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>
            ) : (
              /* COLLAPSED: Show all section icons */
              <nav className="space-y-1">
                {navCategories.map((cat) => {
                  const isActive =
                    cat.route && !cat.route.startsWith('http')
                      ? pathname.startsWith(cat.route)
                      : cat.apps.some((app) => pathname.startsWith(app.route));
                  const SectionIcon = resolveIcon(cat.icon);
                  return (
                    <NavItem
                      key={cat.key}
                      icon={<SectionIcon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />}
                      label={cat.name}
                      isActive={!!isActive}
                      isExpanded={false}
                      onClick={() => (cat.route ? handleNavigate(cat.route) : setIsExpanded(true))}
                    />
                  );
                })}
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
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-2.5 rounded-md px-1 py-0.5 ${isActive ? 'text-white' : 'text-white/70'} ${!isExpanded ? 'justify-center px-0' : ''}`}
      title={!isExpanded ? label : undefined}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
          isActive ? 'bg-white/10' : 'group-hover:bg-white/10'
        }`}
      >
        <span className="group-hover:text-primary transition-colors duration-300 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      </div>

      {isExpanded && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="group-hover:text-primary flex-1 truncate text-left text-xs font-medium transition-colors duration-300"
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
