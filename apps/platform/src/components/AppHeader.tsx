'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Search, Menu, Mail, MessageCircle } from 'lucide-react';
import { QuickActions } from '@church/nextjs-ui/components/QuickActions';
import ChurchLogo from '@/components/ChurchLogo';
import SearchSheet from '@/components/SearchSheet';
import UserAvatar from '@/components/UserAvatar';
import ProfileSheet from '@/components/ProfileSheet';
import SimulationBanner from '@/components/SimulationBanner';
import NavigationSidebar from '@/components/NavigationSidebar';
import AlertBanner from '@/components/AlertBanner';
import { HeaderActionsTarget } from '@/components/HeaderActions';
import { MOCK_NOTIFICATIONS, type Notification } from '@/components/NotificationsSheet';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { churchConfig } from '@/config/church';

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { buildUrl } = usePreserveParams();
  const isAuthenticated = status === 'authenticated';
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    const idToken = session?.idToken;
    await signOut({ redirect: false });
    const params = new URLSearchParams({
      post_logout_redirect_uri: window.location.origin,
    });
    if (idToken) params.set('id_token_hint', idToken);
    window.location.href = `${churchConfig.mpBaseUrl}/oauth/connect/endsession?${params.toString()}`;
  };

  return (
    <>
      <SimulationBanner />
      <header className="bg-secondary text-secondary-foreground">
        {/* Mobile Layout - CSS Grid for dead-center logo */}
        <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-4 md:hidden">
          {/* Left — Hamburger */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="group flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu className="group-hover:text-primary h-6 w-6 transition-colors" />
            </button>
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
              actions={[
                { icon: Search, label: 'Search', onClick: () => setSearchSheetOpen(true) },
                {
                  icon: Mail,
                  label: 'Email',
                  onClick: () => router.push(buildUrl('/email')),
                  isActive: pathname.startsWith('/email'),
                },
                {
                  icon: MessageCircle,
                  label: 'Text',
                  onClick: () => router.push(buildUrl('/text')),
                  isActive: pathname.startsWith('/text'),
                },
              ]}
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
                className="h-7 w-7 text-[#D7D7D7] transition-colors duration-300"
                hoverGradient
              />
            </div>
            <div className="ml-0.5 flex flex-col">
              <span className="group-hover:text-primary text-sm leading-tight font-bold tracking-widest text-white transition-colors duration-300">
                {churchConfig.appName.toUpperCase()}
              </span>
              <span className="group-hover:text-primary text-[9px] leading-tight tracking-widest text-white/50 transition-colors duration-300">
                {churchConfig.name.toUpperCase()}
              </span>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Page action buttons — portaled here by pages via <HeaderActionsPortal> */}
          <HeaderActionsTarget />

          {/* Quick actions: Search, Messages, Text */}
          <div className="ml-2 flex items-center gap-1">
            {[
              {
                icon: Search,
                label: 'Search',
                onClick: () => setSearchSheetOpen(true),
                isActive: false,
              },
              {
                icon: Mail,
                label: 'Messages',
                onClick: () => router.push(buildUrl('/email')),
                isActive: pathname.startsWith('/email'),
              },
              {
                icon: MessageCircle,
                label: 'Text',
                onClick: () => router.push(buildUrl('/text')),
                isActive: pathname.startsWith('/text'),
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

      {/* Search Sheet - unified for both mobile and desktop */}
      <SearchSheet open={searchSheetOpen} onClose={() => setSearchSheetOpen(false)} />

      {/* Navigation Sidebar */}
      <NavigationSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Profile Sheet */}
      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        firstName={session?.firstName}
        lastName={session?.lastName}
        email={session?.email}
        image={session?.image}
        isAdmin={session?.isAdmin}
        onSignOut={handleSignOut}
      />
    </>
  );
}
