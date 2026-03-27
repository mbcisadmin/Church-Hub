'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  LogIn,
  Home,
  History,
  Coffee,
  BarChart3,
  Hash,
  DoorOpen,
  Search,
  PieChart,
  Calendar,
  CalendarDays,
  Users,
  Heart,
  Handshake,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import { HorizontalScroll } from '@church/nextjs-ui/components/HorizontalScroll';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { BaseCard } from '@church/nextjs-ui/components/BaseCard';
import { GroupCard } from '@church/nextjs-ui/components/GroupCard';
import { PersonCard } from '@church/nextjs-ui/components/PersonCard';
import ChurchLogo from '@/components/ChurchLogo';
import { SectionHeader } from '@church/nextjs-ui/components/SectionHeader';
import { TitleHighlight } from '@church/nextjs-ui/components/TitleHighlight';
import { RotatingSubtitle } from '@/components/RotatingSubtitle';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { churchConfig, pageTitle } from '@/config/church';

// Map icon name strings (from DB) to lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  'bar-chart-3': BarChart3,
  hash: Hash,
  'door-open': DoorOpen,
  search: Search,
  'pie-chart': PieChart,
  calendar: Calendar,
  'calendar-days': CalendarDays,
  users: Users,
  heart: Heart,
  handshake: Handshake,
  contact: Users, // 'contact' icon maps to Users
};

function resolveIcon(name?: string): LucideIcon {
  if (!name) return BarChart3;
  return ICON_MAP[name] || BarChart3;
}

interface RecentItem {
  id: string;
  type: 'dashboard' | 'app' | 'person' | 'group' | 'event';
  title: string;
  subtitle?: string;
  route: string;
  icon?: string;
  categoryName?: string;
  categoryIcon?: string;
  avatarUrl?: string;
  initials?: string;
}

function mapHistoryToRecentItems(
  history: Array<{
    id: number;
    type: string;
    title: string;
    subtitle?: string;
    route: string;
    icon?: string;
    imageUrl?: string;
    categoryName?: string;
    categoryIcon?: string;
  }>
): RecentItem[] {
  return history.map((entry) => {
    const item: RecentItem = {
      id: String(entry.id),
      type: entry.type as RecentItem['type'],
      title: entry.title,
      subtitle: entry.subtitle || undefined,
      route: entry.route,
      icon: entry.icon || undefined,
      categoryName: entry.categoryName || undefined,
      categoryIcon: entry.categoryIcon || undefined,
    };

    if (entry.type === 'person') {
      item.avatarUrl = entry.imageUrl || undefined;
      const parts = entry.title.split(' ');
      item.initials =
        parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : entry.title[0];
    }

    return item;
  });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function EmptyStateNotLoggedIn() {
  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
      {/* Big central church logo watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <ChurchLogo className="h-[60vw] max-h-[500px] w-[60vw] max-w-[500px]" />
      </motion.div>

      <section className="relative z-10 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-foreground mb-4 text-5xl font-black tracking-tighter uppercase md:mb-6 md:text-8xl"
        >
          <TitleHighlight animation="underline" inset="1rem">
            Welcome
          </TitleHighlight>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-muted-foreground mt-2 text-sm font-medium tracking-widest uppercase md:text-base"
        >
          You&apos;ve found the Church Hub
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="text-muted-foreground mt-6 max-w-md text-sm tracking-wide md:text-base"
        >
          This is where {churchConfig.name} staff and volunteers access dashboards, tools, and
          resources. Sign in with your Ministry Platform account to get started.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          onClick={() => signIn('ministryplatform')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </motion.button>
      </section>
    </div>
  );
}

function EmptyStateNoPermissions() {
  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
      <section className="relative flex flex-col items-center">
        <SectionHeader
          title="Nothing Here Yet"
          subtitle="Your account doesn't have access to any apps"
          icon={Lock}
          variant="watermark"
          as="h1"
          className="mb-4"
        />
        <p className="text-muted-foreground max-w-md text-sm tracking-wide md:text-base">
          Looks like your account hasn't been set up with permissions yet. If you think this is a
          mistake, reach out to your supervisor or the tech team and they can get you sorted out.
        </p>
      </section>
    </div>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { buildUrl } = usePreserveParams();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    document.title = pageTitle();
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/search/history')
      .then((res) => res.json())
      .then((data) => setRecentItems(mapHistoryToRecentItems(data.history || [])))
      .catch(console.error);
  }, [status]);

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="-mx-4 -mt-12 md:-mx-6 md:-mt-16 lg:-mx-8">
        {/* Animated header - positioned at top of main area */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 pt-12 md:px-6 md:pt-16 lg:px-8"
        >
          <h1 className="text-foreground text-2xl font-bold tracking-tighter uppercase sm:text-3xl md:text-7xl lg:text-8xl">
            <TitleHighlight animation="ellipses" duration={0.8}>
              Loading
            </TitleHighlight>
          </h1>
          <p className="text-muted-foreground mt-1 pl-6 text-sm font-normal tracking-widest uppercase md:text-base">
            Getting things ready for you
          </p>
        </motion.header>

        {/* Logo spinner - centered in the main white area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <LogoSpinner logo={<ChurchLogo className="text-foreground" />} />
        </motion.div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return <EmptyStateNotLoggedIn />;
  }

  const firstName = session?.firstName || 'there';

  return (
    <div className="flex max-w-full min-w-0 flex-col gap-6 overflow-x-hidden md:overflow-visible">
      {/* Welcome Header */}
      <header className="mb-6 min-w-0 overflow-hidden md:mb-12 md:overflow-visible">
        <SectionHeader
          title={
            <>
              <TitleHighlight animation="underline" inset="1rem">
                {getGreeting()}
              </TitleHighlight>
              , {firstName}
            </>
          }
          subtitle={<RotatingSubtitle initialDelay={1400} />}
          icon={Home}
          variant="watermark"
          className="mb-0"
        />
      </header>

      {/* Recent Section */}
      <section className="flex min-w-0 flex-col md:mb-8">
        <SectionTitle
          icon={History}
          title="Recent"
          subtitle="Pick up where you left off"
          iconAnimation="tilt"
          animationFrequency="occasional"
        />
        {recentItems.length > 0 ? (
          <HorizontalScroll>
            {recentItems.map((item) => {
              switch (item.type) {
                case 'dashboard':
                case 'app':
                case 'event': {
                  const AppIcon = resolveIcon(item.icon);
                  const CategoryIcon = item.categoryIcon ? resolveIcon(item.categoryIcon) : null;
                  // Use category icon as watermark if different from app icon
                  const WatermarkIcon =
                    CategoryIcon && item.categoryIcon !== item.icon ? CategoryIcon : AppIcon;
                  // Show foreground icon only if it differs from watermark
                  const showForegroundIcon = CategoryIcon && item.categoryIcon !== item.icon;

                  return (
                    <BaseCard
                      key={item.id}
                      onClick={() => router.push(buildUrl(item.route))}
                      className="justify-center"
                    >
                      <WatermarkIcon className="absolute right-1 bottom-1 h-14 w-14 text-[#e8e8e8] dark:text-[#2a2a2a]" />
                      {showForegroundIcon && (
                        <AppIcon className="text-muted-foreground relative z-10 mb-1 h-6 w-6" />
                      )}
                      <div className="relative z-10 w-full text-center">
                        <p className="text-foreground line-clamp-1 text-xs leading-tight font-bold tracking-wide uppercase">
                          {item.categoryName || item.title}
                        </p>
                        {item.categoryName && item.categoryName !== item.title && (
                          <p className="text-muted-foreground mt-0.5 text-[9px] font-semibold tracking-wider uppercase">
                            {item.title}
                          </p>
                        )}
                      </div>
                    </BaseCard>
                  );
                }
                case 'person':
                  return (
                    <PersonCard
                      key={item.id}
                      name={item.title}
                      role={item.subtitle}
                      avatarUrl={item.avatarUrl}
                      initials={item.initials}
                      onClick={() => router.push(buildUrl(item.route))}
                    />
                  );
                case 'group':
                  return (
                    <GroupCard
                      key={item.id}
                      title={item.title}
                      type={item.subtitle}
                      onClick={() => router.push(buildUrl(item.route))}
                    />
                  );
                default:
                  return null;
              }
            })}
          </HorizontalScroll>
        ) : (
          <div className="flex items-center gap-3 py-4 pl-1">
            <Coffee className="text-muted-foreground/30 h-5 w-5 shrink-0" />
            <p className="text-muted-foreground/50 text-xs tracking-wide">
              Nothing here yet — your recently visited pages will show up here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
