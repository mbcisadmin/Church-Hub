'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UserCircleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';
import { Activity } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import UserMenu from '@/components/UserMenu/UserMenu';
import GlobalSearch from '@/components/GlobalSearch/GlobalSearch';
import { useSession } from '@/components/SessionProvider';
import { signIn } from 'next-auth/react';
import {
  getCurrentUserProfile,
  getUserProfileByContactId,
  updateUserCongregation,
} from '@/components/UserMenu/actions';
import { mpUserProfile } from '@/providers/MinistryPlatform/Interfaces/mpUserProfile';
import { useCampus } from '@/contexts/CampusContext';
import { useStandaloneMode, useAppContext } from '@/hooks/useStandaloneMode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type Application = {
  Application_ID: number;
  Application_Name: string;
  Application_Key: string;
  Description: string;
  Icon: string;
  Route: string;
  Sort_Order: number;
  Requires_Authentication?: boolean;
  Public_Features?: string | null;
};

export default function Header() {
  const [userProfile, setUserProfile] = useState<mpUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<Application[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const [svgError, setSvgError] = useState(false);
  const session = useSession();
  const {
    selectedCampus,
    setSelectedCampus,
    congregations,
    isLoading: campusLoading,
  } = useCampus();
  const pathname = usePathname();
  const isStandalone = useStandaloneMode();
  const appContext = useAppContext(pathname);

  // Get app home URL based on context
  const getAppHomeUrl = () => {
    if (!isStandalone) return '/';
    return appContext === 'default' ? '/' : `/${appContext}`;
  };

  // Reset SVG loading states when campus changes
  useEffect(() => {
    setSvgLoaded(false);
    setSvgError(false);
  }, [selectedCampus?.Congregation_ID]);

  // Fetch user profile (or impersonated user's profile)
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        let profile: mpUserProfile;

        // If impersonating, fetch the impersonated user's profile by Contact_ID
        if (session.simulation?.type === 'impersonate' && session.simulation.contactId) {
          profile = await getUserProfileByContactId(session.simulation.contactId);
        } else {
          // Use logged-in user's User_GUID
          profile = await getCurrentUserProfile(session.user.id);
        }

        setUserProfile(profile);

        // Set campus based on user's Web_Congregation_ID if available
        if (profile.Web_Congregation_ID && congregations.length > 0) {
          const userCampus = congregations.find(
            (c) => c.Congregation_ID === profile.Web_Congregation_ID
          );
          if (userCampus) {
            setSelectedCampus(userCampus);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [session?.user?.id, session?.simulation, congregations, setSelectedCampus]);

  // Fetch applications
  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch('/api/applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        setApps(data);
      } catch (error) {
        console.error('Error loading applications:', error);
      }
    }

    loadApplications();
  }, []);

  // Map icon name from database to Lucide icon component
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || Activity; // Fallback to Activity icon
  };

  // Handle mobile menu close on escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 h-16 shadow-lg dark:shadow-[0_1px_8px_0_rgb(0_0_0_/_0.7)]">
        {/* Header background */}
        <div className="pointer-events-none absolute inset-0 border-b border-white/30 bg-white/40 backdrop-blur-xl dark:border-b-0 dark:bg-[oklch(0.12_0.005_0)]/60" />

        <div className="relative mx-auto h-full max-w-[1600px] px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between md:gap-2 lg:gap-0">
            {/* Left - Mobile: Hamburger + Search, Desktop: Logo & Navigation */}
            <div className="flex flex-1 items-center gap-2 md:flex-initial md:shrink-0">
              {/* Mobile Menu Button - Hide in standalone mode */}
              {!isStandalone && (
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="text-foreground hover:text-primary active:text-primary pointer-events-auto -ml-2 p-2 transition-colors md:hidden dark:text-[oklch(0.8_0_0)] dark:hover:text-[#61bc47] dark:active:text-[#61bc47]"
                  aria-label="Open menu"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
              )}

              {/* Mobile Search Icon - Hide in standalone mode */}
              {!isStandalone && (
                <div className="pointer-events-auto md:hidden">
                  <GlobalSearch isMobile={true} />
                </div>
              )}

              {/* Desktop Logo */}
              <Link
                href={getAppHomeUrl()}
                className="logo-link pointer-events-auto mr-3 hidden items-center md:flex"
              >
                <div className="relative h-10 w-10 shrink-0">
                  <svg
                    className="logo-svg h-full w-full"
                    viewBox="0 0 822.73 822.41"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M482.59,292.96c-28.5,75.56-63.52,148.62-91.88,224.24-22.85,60.93-44.5,165.54,5.99,218.03,53.19,55.31,103.27-36.03,126.36-76.12,29.77-51.67,60.19-102.91,92.51-153.1,37.77-58.65,82.78-117.18,128.05-170.34,17.33-20.35,35.58-39.9,55.18-58.05,1.32-.3,1.67.72,2.19,1.61,2.7,4.68,6.16,19.72,7.79,25.79,55.59,207.53-59.67,424.44-261.39,494.49-162.86,56.55-343.5,6.03-452.97-125.71l.02-2.82c22.1-29.38,43.34-59.51,66.31-88.22,46.87-58.59,104.84-117,159.18-168.95,39.21-37.49,94.79-86.04,141.88-112.38,2.97-1.66,18.74-10.3,20.79-8.46Z"
                      fill="currentColor"
                    />
                    <path
                      d="M454.78,615.29c-.4-37.26,12.31-73.93,23.96-108.91,21.35-64.11,58.46-144.93,65.26-211.05,10.09-98.15-75.84-54.82-121.59-23.71-87.22,59.32-157.97,140.42-238.72,207.44-1.08.9-1.56,2.33-3.36,1.91,29.91-61.5,79.75-118.22,92.63-187.03,26.62-142.2-143-109.97-223.13-77.75-1.54-1.51,19.5-33.71,21.85-37.14C170.36,35.21,348.48-31.19,518.31,14.05c111.97,29.83,206.98,107.78,259.7,210.54l-1.23,3.19c-101.38,85.68-182.57,188.93-258.5,297.03-21.17,30.14-40.81,61.47-63.5,90.48Z"
                      fill="currentColor"
                    />
                    <path
                      d="M38.3,581.71c-6.2-9.05-10.4-20.99-14.14-31.42C-1.72,478.2-6.79,400.44,8.86,325.38c1.73-8.3,5.99-29.98,9.5-36.56,1.25-2.35,11.96-9.93,14.86-12.01,41.76-29.96,121.9-63.33,173.22-50.74,49.51,12.15,15.29,70.69-.39,97.86-34.22,59.31-78.86,114.75-116.32,172.48-18.06,27.83-35.65,56.1-51.43,85.3Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </Link>

              {/* Desktop Navigation - Hide in standalone mode */}
              {!isStandalone && (
                <nav className="hidden items-center gap-1 md:flex">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-foreground hover:!text-primary focus:!text-primary active:!text-primary pointer-events-auto flex items-center gap-1 !border-none !bg-transparent px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-colors hover:!bg-transparent focus:!bg-transparent focus:outline-none active:!bg-transparent data-[state=open]:!bg-transparent dark:text-[oklch(0.8_0_0)] dark:hover:!text-[#61bc47] dark:focus:!text-[#61bc47] dark:active:!text-[#61bc47]">
                      APPS
                      <ChevronDownIcon className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="z-[60] w-64 border-white/30 bg-white/50 shadow-2xl backdrop-blur-2xl dark:border-[oklch(0.3_0.005_0)] dark:bg-[oklch(0.16_0.005_0)]/95"
                    >
                      {apps.map((app) => {
                        const Icon = getIcon(app.Icon);
                        const route = app.Route || '#';
                        return (
                          <DropdownMenuItem
                            key={app.Application_ID}
                            asChild
                            className="hover:bg-transparent focus:bg-transparent data-[highlighted]:bg-transparent"
                          >
                            <Link
                              href={route}
                              className="group flex cursor-pointer items-center gap-3 rounded-md p-3 transition-colors"
                            >
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#61bc47]/10 transition-all group-hover:bg-[#61bc47] group-focus:bg-[#61bc47]">
                                <Icon className="h-5 w-5 text-[#61bc47] transition-colors group-hover:text-white group-focus:text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-foreground group-hover:text-primary text-sm font-semibold transition-colors dark:group-hover:text-[#61bc47]">
                                  {app.Application_Name}
                                </p>
                                <p className="text-muted-foreground truncate text-xs transition-colors">
                                  {app.Description}
                                </p>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </nav>
              )}
            </div>

            {/* Center - Desktop Search (inline at md, centered at lg+) OR Mobile Logo */}
            <div className="pointer-events-auto flex items-center justify-center md:hidden">
              {/* Mobile Logo */}
              <Link href={getAppHomeUrl()} className="logo-link flex items-center p-2">
                <div className="relative h-10 w-10 shrink-0">
                  <svg
                    className="logo-svg h-full w-full"
                    viewBox="0 0 822.73 822.41"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M482.59,292.96c-28.5,75.56-63.52,148.62-91.88,224.24-22.85,60.93-44.5,165.54,5.99,218.03,53.19,55.31,103.27-36.03,126.36-76.12,29.77-51.67,60.19-102.91,92.51-153.1,37.77-58.65,82.78-117.18,128.05-170.34,17.33-20.35,35.58-39.9,55.18-58.05,1.32-.3,1.67.72,2.19,1.61,2.7,4.68,6.16,19.72,7.79,25.79,55.59,207.53-59.67,424.44-261.39,494.49-162.86,56.55-343.5,6.03-452.97-125.71l.02-2.82c22.1-29.38,43.34-59.51,66.31-88.22,46.87-58.59,104.84-117,159.18-168.95,39.21-37.49,94.79-86.04,141.88-112.38,2.97-1.66,18.74-10.3,20.79-8.46Z"
                      fill="currentColor"
                    />
                    <path
                      d="M454.78,615.29c-.4-37.26,12.31-73.93,23.96-108.91,21.35-64.11,58.46-144.93,65.26-211.05,10.09-98.15-75.84-54.82-121.59-23.71-87.22,59.32-157.97,140.42-238.72,207.44-1.08.9-1.56,2.33-3.36,1.91,29.91-61.5,79.75-118.22,92.63-187.03,26.62-142.2-143-109.97-223.13-77.75-1.54-1.51,19.5-33.71,21.85-37.14C170.36,35.21,348.48-31.19,518.31,14.05c111.97,29.83,206.98,107.78,259.7,210.54l-1.23,3.19c-101.38,85.68-182.57,188.93-258.5,297.03-21.17,30.14-40.81,61.47-63.5,90.48Z"
                      fill="currentColor"
                    />
                    <path
                      d="M38.3,581.71c-6.2-9.05-10.4-20.99-14.14-31.42C-1.72,478.2-6.79,400.44,8.86,325.38c1.73-8.3,5.99-29.98,9.5-36.56,1.25-2.35,11.96-9.93,14.86-12.01,41.76-29.96,121.9-63.33,173.22-50.74,49.51,12.15,15.29,70.69-.39,97.86-34.22,59.31-78.86,114.75-116.32,172.48-18.06,27.83-35.65,56.1-51.43,85.3Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </Link>
            </div>

            {/* Desktop Search - Hide in standalone mode */}
            {!isStandalone && (
              <div className="hidden md:relative md:flex md:flex-1 md:px-0 lg:absolute lg:top-1/2 lg:left-1/2 lg:w-full lg:max-w-md lg:-translate-x-1/2 lg:-translate-y-1/2 lg:px-4">
                <GlobalSearch isMobile={false} />
              </div>
            )}

            {/* Right - Campus Selector + User avatar */}
            <div className="flex flex-1 items-center justify-end gap-2 md:flex-initial md:shrink-0 md:gap-4">
              {/* Campus Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-foreground hover:!text-primary focus:!text-primary active:!text-primary group pointer-events-auto flex items-center gap-1 !border-none !bg-transparent p-1 text-xs font-medium transition-colors hover:!bg-transparent focus:!bg-transparent focus:outline-none active:!bg-transparent data-[state=open]:!bg-transparent md:gap-2 md:px-3 md:py-2 md:text-sm dark:text-[oklch(0.8_0_0)] dark:hover:!text-[#61bc47] dark:focus:!text-[#61bc47] dark:active:!text-[#61bc47]">
                  {selectedCampus?.Campus_SVG_URL && !svgError ? (
                    <>
                      <img
                        src={selectedCampus.Campus_SVG_URL}
                        alt=""
                        className={`h-6 w-6 grayscale transition-all duration-200 group-hover:grayscale-0 md:h-10 md:w-10 ${svgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setSvgLoaded(true)}
                        onError={() => setSvgError(true)}
                        style={{ display: svgLoaded ? 'block' : 'none' }}
                      />
                      {!svgLoaded && (
                        <div className="bg-foreground/10 border-foreground/20 flex h-6 w-6 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-200 group-hover:border-[#61bc47]/30 group-hover:bg-[#61bc47]/20 md:h-10 md:w-10 dark:border-[oklch(0.8_0_0)]/20 dark:bg-[oklch(0.8_0_0)]/10">
                          <MapPinIcon className="text-foreground h-3 w-3 transition-colors group-hover:text-[#61bc47] md:h-5 md:w-5 dark:text-[oklch(0.8_0_0)] dark:group-hover:text-[#61bc47]" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-foreground/10 border-foreground/20 flex h-6 w-6 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-200 group-hover:border-[#61bc47]/30 group-hover:bg-[#61bc47]/20 md:h-10 md:w-10 dark:border-[oklch(0.8_0_0)]/20 dark:bg-[oklch(0.8_0_0)]/10">
                      <MapPinIcon className="text-foreground h-3 w-3 transition-colors group-hover:text-[#61bc47] md:h-5 md:w-5 dark:text-[oklch(0.8_0_0)] dark:group-hover:text-[#61bc47]" />
                    </div>
                  )}
                  {campusLoading ? (
                    <span className="hidden md:inline">Loading...</span>
                  ) : selectedCampus ? (
                    <>
                      <span className="text-sm lg:hidden">
                        {selectedCampus.Congregation_Short_Name || selectedCampus.Congregation_Name}
                      </span>
                      <span className="hidden lg:inline">{selectedCampus.Congregation_Name}</span>
                    </>
                  ) : (
                    <span className="hidden md:inline">Select Campus</span>
                  )}
                  <ChevronDownIcon className="h-3 w-3 md:h-4 md:w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-[60] w-56 border-white/30 bg-white/50 shadow-2xl backdrop-blur-2xl dark:border-[oklch(0.3_0.005_0)] dark:bg-[oklch(0.16_0.005_0)]/95"
                >
                  {congregations.map((congregation) => (
                    <DropdownMenuItem
                      key={congregation.Congregation_ID}
                      onClick={async () => {
                        setSelectedCampus(congregation);
                        // Update MP if user is logged in
                        if (userProfile?.Contact_ID) {
                          try {
                            await updateUserCongregation(
                              userProfile.Contact_ID,
                              congregation.Congregation_ID
                            );
                          } catch (error) {
                            console.error('Failed to update congregation in MP:', error);
                          }
                        }
                      }}
                      className={`group cursor-pointer ${
                        selectedCampus?.Congregation_ID === congregation.Congregation_ID
                          ? 'bg-primary/10 text-primary font-semibold'
                          : ''
                      }`}
                    >
                      {congregation.Campus_SVG_URL ? (
                        <img
                          src={congregation.Campus_SVG_URL}
                          alt={`${congregation.Congregation_Name} Campus`}
                          className={`mr-2 h-10 w-10 transition-all duration-200 ${
                            selectedCampus?.Congregation_ID === congregation.Congregation_ID
                              ? ''
                              : 'grayscale group-hover:grayscale-0'
                          }`}
                        />
                      ) : (
                        <div
                          className={`mr-2 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-200 ${
                            selectedCampus?.Congregation_ID === congregation.Congregation_ID
                              ? 'border-[#61bc47]/30 bg-[#61bc47]/20'
                              : 'bg-foreground/10 border-foreground/20 group-hover:border-[#61bc47]/30 group-hover:bg-[#61bc47]/20 dark:border-[oklch(0.8_0_0)]/20 dark:bg-[oklch(0.8_0_0)]/10'
                          }`}
                        >
                          <MapPinIcon
                            className={`h-5 w-5 transition-colors ${
                              selectedCampus?.Congregation_ID === congregation.Congregation_ID
                                ? 'text-[#61bc47]'
                                : 'text-foreground group-hover:text-[#61bc47]'
                            }`}
                          />
                        </div>
                      )}
                      {congregation.Congregation_Name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Avatar */}
              <div className="pointer-events-auto relative">
                {!loading && userProfile ? (
                  <UserMenu userProfile={userProfile}>
                    <button
                      className="group rounded-full p-0 focus:outline-none"
                      aria-label="User menu"
                      title={
                        userProfile?.First_Name && userProfile?.Last_Name
                          ? `${userProfile.First_Name} ${userProfile.Last_Name}`
                          : session?.user?.name || session?.user?.email || 'User menu'
                      }
                    >
                      {userProfile?.Image_GUID ? (
                        <div
                          className={
                            session?.simulation?.type === 'impersonate'
                              ? 'relative rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-[2px]'
                              : ''
                          }
                        >
                          <img
                            src={`${process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL}/${userProfile.Image_GUID}?$thumbnail=true`}
                            alt={
                              userProfile.First_Name && userProfile.Last_Name
                                ? `${userProfile.First_Name} ${userProfile.Last_Name}`
                                : 'User avatar'
                            }
                            className={`h-8 w-8 rounded-full object-cover transition-colors md:h-10 md:w-10 ${
                              session?.simulation?.type === 'impersonate'
                                ? 'border-2 border-white dark:border-[oklch(0.12_0.005_0)]'
                                : 'group-hover:border-primary border-2 border-transparent dark:group-hover:border-[#61bc47]'
                            }`}
                          />
                        </div>
                      ) : (
                        <UserCircleIcon className="text-secondary group-hover:text-primary h-8 w-8 transition-colors md:h-10 md:w-10 dark:group-hover:text-[#61bc47]" />
                      )}
                    </button>
                  </UserMenu>
                ) : (
                  <button
                    onClick={() => signIn('ministryplatform')}
                    className="group cursor-pointer rounded-full p-0 focus:outline-none"
                    aria-label="Sign in"
                    title="Click to sign in"
                  >
                    <UserCircleIcon className="text-secondary group-hover:text-primary h-8 w-8 transition-colors md:h-10 md:w-10 dark:group-hover:text-[#61bc47]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <div
            className={`fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] transform bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-[oklch(0.16_0.005_0)] ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } md:hidden`}
          >
            {/* Sidebar Header */}
            <div className="border-border flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <svg
                  className="logo-svg h-8 w-8"
                  viewBox="0 0 822.73 822.41"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M482.59,292.96c-28.5,75.56-63.52,148.62-91.88,224.24-22.85,60.93-44.5,165.54,5.99,218.03,53.19,55.31,103.27-36.03,126.36-76.12,29.77-51.67,60.19-102.91,92.51-153.1,37.77-58.65,82.78-117.18,128.05-170.34,17.33-20.35,35.58-39.9,55.18-58.05,1.32-.3,1.67.72,2.19,1.61,2.7,4.68,6.16,19.72,7.79,25.79,55.59,207.53-59.67,424.44-261.39,494.49-162.86,56.55-343.5,6.03-452.97-125.71l.02-2.82c22.1-29.38,43.34-59.51,66.31-88.22,46.87-58.59,104.84-117,159.18-168.95,39.21-37.49,94.79-86.04,141.88-112.38,2.97-1.66,18.74-10.3,20.79-8.46Z"
                    fill="currentColor"
                  />
                  <path
                    d="M454.78,615.29c-.4-37.26,12.31-73.93,23.96-108.91,21.35-64.11,58.46-144.93,65.26-211.05,10.09-98.15-75.84-54.82-121.59-23.71-87.22,59.32-157.97,140.42-238.72,207.44-1.08.9-1.56,2.33-3.36,1.91,29.91-61.5,79.75-118.22,92.63-187.03,26.62-142.2-143-109.97-223.13-77.75-1.54-1.51,19.5-33.71,21.85-37.14C170.36,35.21,348.48-31.19,518.31,14.05c111.97,29.83,206.98,107.78,259.7,210.54l-1.23,3.19c-101.38,85.68-182.57,188.93-258.5,297.03-21.17,30.14-40.81,61.47-63.5,90.48Z"
                    fill="currentColor"
                  />
                  <path
                    d="M38.3,581.71c-6.2-9.05-10.4-20.99-14.14-31.42C-1.72,478.2-6.79,400.44,8.86,325.38c1.73-8.3,5.99-29.98,9.5-36.56,1.25-2.35,11.96-9.93,14.86-12.01,41.76-29.96,121.9-63.33,173.22-50.74,49.51,12.15,15.29,70.69-.39,97.86-34.22,59.31-78.86,114.75-116.32,172.48-18.06,27.83-35.65,56.1-51.43,85.3Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-lg font-bold tracking-wide uppercase">Menu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-primary -mr-2 p-2 transition-colors dark:hover:text-[#61bc47]"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col space-y-2 p-4">
              {/* Apps Section */}
              <div className="pt-2">
                <p className="text-muted-foreground px-4 py-2 text-xs font-bold tracking-wider uppercase">
                  Apps
                </p>
                {apps.map((app) => {
                  const Icon = getIcon(app.Icon);
                  const route = app.Route || '#';
                  return (
                    <Link
                      key={app.Application_ID}
                      href={route}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#61bc47]/10 transition-all group-hover:bg-[#61bc47] group-focus:bg-[#61bc47]">
                        <Icon className="h-5 w-5 text-[#61bc47] transition-colors group-hover:text-white group-focus:text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground group-hover:text-primary text-sm font-semibold transition-colors dark:group-hover:text-[#61bc47]">
                          {app.Application_Name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">{app.Description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
