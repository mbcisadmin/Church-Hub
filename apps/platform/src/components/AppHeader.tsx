'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Search, Menu, MapPin, ChevronDown } from 'lucide-react';
import { QuickActions } from '@church/nextjs-ui/components/QuickActions';
import ChurchLogo from '@/components/ChurchLogo';
import CampusSheet from '@/components/CampusSheet';
import SearchSheet from '@/components/SearchSheet';
import UserAvatar from '@/components/UserAvatar';
import ProfileOverlay from '@/components/ProfileOverlay';
import SimulationBanner from '@/components/SimulationBanner';
import NavigationSidebar from '@/components/NavigationSidebar';
import AlertBanner from '@/components/AlertBanner';
import { HeaderActionsTarget } from '@/components/HeaderActions';
import { MOCK_NOTIFICATIONS, type Notification } from '@/components/NotificationsSheet';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { useCampus } from '@/contexts/CampusContext';

function CampusTrigger({ onClick }: { onClick: () => void }) {
  const { selectedCampus, isLoading } = useCampus();

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-1 p-1 text-xs font-medium text-white/70 transition-colors hover:text-white focus:text-white focus:outline-none md:gap-2 md:px-3 md:py-2 md:text-sm"
      aria-label="Select campus"
    >
      <div className="group-hover:border-primary/30 group-hover:bg-primary/20 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm md:h-7 md:w-7">
        <MapPin className="group-hover:text-primary h-3 w-3 text-white/70 md:h-4 md:w-4" />
      </div>
      {isLoading ? (
        <span className="hidden text-[13px] font-medium tracking-[0.2em] uppercase md:inline">
          Loading...
        </span>
      ) : selectedCampus ? (
        <span className="text-[13px] font-medium tracking-[0.2em] uppercase">
          {selectedCampus.Congregation_Name}
        </span>
      ) : (
        <span className="hidden text-[13px] font-medium tracking-[0.2em] uppercase md:inline">
          Select Campus
        </span>
      )}
      <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
    </button>
  );
}

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { buildUrl } = usePreserveParams();
  const isAuthenticated = status === 'authenticated';
  const [campusSheetOpen, setCampusSheetOpen] = useState(false);
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <SimulationBanner />
      <header className="bg-secondary text-secondary-foreground">
        {/* Mobile Layout - CSS Grid for dead-center logo */}
        <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-4 md:hidden">
          {/* Left — Hamburger + Campus */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="group flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="group-hover:text-primary h-6 w-6 transition-colors" />
            </button>
            <CampusTrigger onClick={() => setCampusSheetOpen(true)} />
          </div>

          {/* Center — Logo (always dead center) */}
          <div className="flex justify-center">
            <Link href="/" className="group">
              <ChurchLogo className="group-hover:text-primary h-8 w-8 text-[#D7D7D7] transition-colors duration-300" />
            </Link>
          </div>

          {/* Right — Quick Actions + Avatar */}
          <div className="flex items-center justify-end gap-2">
            <QuickActions
              actions={[{ icon: Search, label: 'Search', onClick: () => setSearchSheetOpen(true) }]}
            />
            <div
              data-profile-avatar
              role="button"
              tabIndex={0}
              onClick={() => {
                if (isAuthenticated) setProfileOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isAuthenticated) setProfileOpen(true);
              }}
              className="hover:border-primary cursor-pointer rounded-full border-2 border-transparent bg-transparent p-0 transition-colors outline-none"
            >
              <UserAvatar
                firstName={session?.firstName}
                lastName={session?.lastName}
                image={session?.image}
                isAuthenticated={isAuthenticated}
                showNotificationDot={unreadCount > 0}
              />
            </div>
          </div>
        </div>

        {/* Desktop Layout - Full width header with logo on left */}
        <div className="hidden h-14 items-center pr-4 md:flex">
          {/* Logo + Title - logo centered in 56px to align with rail icons below */}
          <Link href="/" className="group flex items-center">
            <div className="flex w-14 shrink-0 items-center justify-center">
              <ChurchLogo
                className="h-7 w-7 text-white/70 transition-colors duration-300"
                hoverGradient
              />
            </div>
            <div className="ml-0.5 flex flex-col">
              <span className="group-hover:text-primary text-base leading-tight font-extrabold tracking-wide text-white transition-colors duration-300">
                MCLEAN
              </span>
              <span className="group-hover:text-primary text-[9px] leading-tight font-bold tracking-widest text-white/50 transition-colors duration-300">
                BIBLE CHURCH
              </span>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Page action buttons — portaled here by pages via <HeaderActionsPortal> */}
          <HeaderActionsTarget />

          {/* Campus selector */}
          <CampusTrigger onClick={() => setCampusSheetOpen(true)} />

          {/* Quick actions: Search */}
          <div className="ml-2 flex items-center gap-1">
            {[
              {
                icon: Search,
                label: 'Search',
                onClick: () => setSearchSheetOpen(true),
                isActive: false,
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${
                    action.isActive ? 'text-primary' : 'text-white/70 hover:text-white'
                  }`}
                  title={action.label}
                  aria-label={action.label}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </button>
              );
            })}
          </div>

          {/* Avatar */}
          <div
            data-profile-avatar
            role="button"
            tabIndex={0}
            onClick={() => {
              if (isAuthenticated) setProfileOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isAuthenticated) setProfileOpen(true);
            }}
            className="hover:border-primary ml-1 cursor-pointer rounded-full border-2 border-transparent p-0 transition-colors outline-none"
          >
            <UserAvatar
              firstName={session?.firstName}
              lastName={session?.lastName}
              image={session?.image}
              isAuthenticated={isAuthenticated}
              size="sm"
              showNotificationDot={unreadCount > 0}
            />
          </div>
        </div>
      </header>

      {/* Critical Alert Banner - appears below header */}
      <AlertBanner />

      {/* Campus Sheet */}
      <CampusSheet open={campusSheetOpen} onClose={() => setCampusSheetOpen(false)} />

      {/* Search Sheet - unified for both mobile and desktop */}
      <SearchSheet open={searchSheetOpen} onClose={() => setSearchSheetOpen(false)} />

      {/* Navigation Sidebar */}
      <NavigationSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Profile Overlay */}
      <ProfileOverlay open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
