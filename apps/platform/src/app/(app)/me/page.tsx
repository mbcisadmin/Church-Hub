'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  User,
  Pencil,
  MapPin,
  Check,
  X,
  CalendarDays,
  HandCoins,
  UsersRound,
  Handshake,
  UserSearch,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  UserPlus,
  Bell,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import ProfileSheet from '@/components/ProfileSheet';
import ImpersonateModal from '@/components/ImpersonateModal';
import {
  MOCK_NOTIFICATIONS,
  type Notification,
  formatTimestamp,
} from '@/components/NotificationsSheet';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { churchConfig } from '@/config/church';

const BRAND_GREEN_GRADIENT = 'var(--brand-gradient)';

// Types for API response
interface ProfileAddress {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

interface HouseholdMember {
  contactId: number;
  firstName: string | null;
  lastName: string | null;
  position: string | null;
  email: string | null;
  mobilePhone: string | null;
  age: number | null;
  imageUrl: string | null;
}

interface ProfileData {
  address: ProfileAddress | null;
  householdMembers: HouseholdMember[];
}

// Mock data (same as ProfileSheet)
const MOCK_HOUSEHOLD_MEMBERS: HouseholdMember[] = [
  {
    contactId: 1001,
    firstName: 'Sarah',
    lastName: 'Johnson',
    position: 'Spouse',
    email: 'sarah.johnson@example.com',
    mobilePhone: '(555) 555-0102',
    age: 32,
    imageUrl: null,
  },
  {
    contactId: 1002,
    firstName: 'Emma',
    lastName: 'Johnson',
    position: 'Child',
    email: null,
    mobilePhone: null,
    age: 8,
    imageUrl: null,
  },
  {
    contactId: 1003,
    firstName: 'Noah',
    lastName: 'Johnson',
    position: 'Child',
    email: null,
    mobilePhone: null,
    age: 5,
    imageUrl: null,
  },
];

const MOCK_ADDRESS: ProfileAddress = {
  line1: '1234 Maple Street',
  line2: null,
  city: 'Anytown',
  state: 'US',
  zip: '12345',
};

const MY_STUFF_ITEMS = [
  { label: 'Events', route: '/me/events', icon: CalendarDays },
  { label: 'Giving', route: '/me/giving', icon: HandCoins },
  { label: 'Groups', route: '/me/groups', icon: UsersRound },
  { label: 'Serving', route: '/me/serving', icon: Handshake },
];

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { buildUrl } = usePreserveParams();
  const isAdmin = session?.isAdmin ?? false;

  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [impersonateModalOpen, setImpersonateModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
    if (notification.url) {
      router.push(buildUrl(notification.url));
    }
  };
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Address editing state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const emptyAddress = { line1: '', line2: '', city: '', state: '', zip: '' };
  const currentAddress = profileData?.address
    ? {
        line1: profileData.address.line1 || '',
        line2: profileData.address.line2 || '',
        city: profileData.address.city || '',
        state: profileData.address.state || '',
        zip: profileData.address.zip || '',
      }
    : emptyAddress;
  const [editedAddress, setEditedAddress] = useState(currentAddress);

  useEffect(() => {
    document.title = 'Profile | The Hub';
  }, []);

  // Update editedAddress when profileData changes
  useEffect(() => {
    if (profileData?.address) {
      setEditedAddress({
        line1: profileData.address.line1 || '',
        line2: profileData.address.line2 || '',
        city: profileData.address.city || '',
        state: profileData.address.state || '',
        zip: profileData.address.zip || '',
      });
    }
  }, [profileData]);

  // Fetch profile data on mount
  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      const hasRealData = data.householdMembers?.length > 0 || data.address?.line1;
      setProfileData({
        address: hasRealData ? data.address : MOCK_ADDRESS,
        householdMembers: hasRealData ? data.householdMembers : MOCK_HOUSEHOLD_MEMBERS,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileData({
        address: MOCK_ADDRESS,
        householdMembers: MOCK_HOUSEHOLD_MEMBERS,
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = async () => {
    const idToken = session?.idToken;
    await signOut({ redirect: false });
    const params = new URLSearchParams({
      post_logout_redirect_uri: window.location.origin,
    });
    if (idToken) {
      params.set('id_token_hint', idToken);
    }
    window.location.href = `${churchConfig.mpBaseUrl}/oauth/connect/endsession?${params.toString()}`;
  };

  const formatAddress = () => {
    if (!profileData?.address) return 'No address on file';
    const addr = profileData.address;
    const parts = [];
    if (addr.line1) parts.push(addr.line1);
    if (addr.line2) parts.push(addr.line2);
    if (addr.city || addr.state || addr.zip) {
      parts.push(`${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`.trim());
    }
    return parts.length > 0 ? parts.join(', ') : 'No address on file';
  };

  const handleSaveAddress = () => {
    setIsEditingAddress(false);
    console.log('Saving address:', editedAddress);
    alert('Address saving coming soon!');
  };

  const handleCancelAddressEdit = () => {
    setEditedAddress(currentAddress);
    setIsEditingAddress(false);
  };

  const displayName = [session?.firstName, session?.lastName].filter(Boolean).join(' ') || 'User';
  const initials =
    `${session?.firstName?.charAt(0) ?? ''}${session?.lastName?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <header>
          <SectionHeader
            title="Profile"
            subtitle={session?.email || 'Your account'}
            icon={User}
            variant="watermark"
            className="mb-0"
          />
        </header>

        {/* Profile Card */}
        <section className="bg-card overflow-hidden rounded-xl border shadow-sm">
          <div
            className="relative overflow-hidden px-6 pt-6 pb-8"
            style={{ background: BRAND_GREEN_GRADIENT }}
          >
            {/* Watermark */}
            <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
              <User className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
            </div>

            <div className="relative z-10 flex items-center gap-5">
              {/* Avatar */}
              <div className="rounded-full border-2 border-white/30 p-1">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/20">
                  {session?.image ? (
                    <img
                      src={session.image}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-2xl font-semibold text-white">${initials || '?'}</span>`;
                        }
                      }}
                    />
                  ) : initials ? (
                    <span className="text-2xl font-semibold text-white">{initials}</span>
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>

              {/* Name + Info */}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-white">{displayName}</h2>
                {session?.email && <p className="mt-0.5 text-sm text-white/70">{session.email}</p>}
              </div>

              {/* Edit button */}
              <button
                onClick={() => setProfileSheetOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition-colors hover:bg-gray-100"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-card overflow-hidden rounded-xl border shadow-sm">
          <div
            className="relative overflow-hidden px-6 py-4"
            style={{ background: BRAND_GREEN_GRADIENT }}
          >
            {/* Bell watermark */}
            <div className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
              <Bell className="h-20 w-20 text-white opacity-10" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold tracking-wider text-white/70 uppercase">
                  Notifications
                </h3>
                <p className="mt-0.5 text-lg font-bold text-white">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/30"
                >
                  <Check className="h-4 w-4" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification items */}
          <div>
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className="hover:bg-muted/50 border-border/50 flex w-full items-start gap-3 border-b p-4 text-left transition-colors last:border-b-0"
              >
                <div className="mt-1.5 flex h-2.5 w-2.5 flex-shrink-0 items-center justify-center">
                  {!n.read && <div className="bg-primary h-2.5 w-2.5 rounded-full" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${n.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}
                  >
                    {n.title}
                  </p>
                  {n.description && (
                    <p className="text-muted-foreground mt-0.5 text-sm">{n.description}</p>
                  )}
                  <p className="text-muted-foreground mt-1 text-xs">
                    {n.category} · {formatTimestamp(n.timestamp)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Address Section */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Address
            </h3>
            {!isEditingAddress && !isLoadingProfile && profileData?.address && (
              <button
                onClick={() => setIsEditingAddress(true)}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {isLoadingProfile ? (
            <div className="bg-muted flex animate-pulse items-center gap-3 p-3">
              <div className="bg-muted-foreground/20 h-10 w-10 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted-foreground/20 h-4 w-3/4 rounded" />
                <div className="bg-muted-foreground/20 h-3 w-1/2 rounded" />
              </div>
            </div>
          ) : isEditingAddress ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedAddress.line1}
                onChange={(e) => setEditedAddress({ ...editedAddress, line1: e.target.value })}
                placeholder="Address Line 1"
                className="bg-muted text-foreground placeholder:text-muted-foreground focus:ring-primary w-full border-0 px-4 py-3 focus:ring-2 focus:outline-none"
              />
              <input
                type="text"
                value={editedAddress.line2}
                onChange={(e) => setEditedAddress({ ...editedAddress, line2: e.target.value })}
                placeholder="Address Line 2 (optional)"
                className="bg-muted text-foreground placeholder:text-muted-foreground focus:ring-primary w-full border-0 px-4 py-3 focus:ring-2 focus:outline-none"
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  value={editedAddress.city}
                  onChange={(e) => setEditedAddress({ ...editedAddress, city: e.target.value })}
                  placeholder="City"
                  className="bg-muted text-foreground placeholder:text-muted-foreground focus:ring-primary flex-1 border-0 px-4 py-3 focus:ring-2 focus:outline-none"
                />
                <input
                  type="text"
                  value={editedAddress.state}
                  onChange={(e) => setEditedAddress({ ...editedAddress, state: e.target.value })}
                  placeholder="State"
                  className="bg-muted text-foreground placeholder:text-muted-foreground focus:ring-primary w-20 border-0 px-4 py-3 focus:ring-2 focus:outline-none"
                />
                <input
                  type="text"
                  value={editedAddress.zip}
                  onChange={(e) => setEditedAddress({ ...editedAddress, zip: e.target.value })}
                  placeholder="ZIP"
                  className="bg-muted text-foreground placeholder:text-muted-foreground focus:ring-primary w-24 border-0 px-4 py-3 focus:ring-2 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveAddress}
                  className="flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors"
                  style={{ background: BRAND_GREEN_GRADIENT }}
                >
                  <Check className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={handleCancelAddressEdit}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted flex flex-1 items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingAddress(true)}
              className="bg-muted hover:bg-muted-foreground/20 flex w-full items-center gap-3 p-3 text-left transition-all"
            >
              <div className="bg-muted-foreground/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                <MapPin className="text-muted-foreground h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm">{formatAddress()}</p>
              </div>
              <Pencil className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            </button>
          )}
        </section>

        {/* Household Section */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
            Household
          </h3>
          {isLoadingProfile ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="bg-muted flex animate-pulse items-center gap-3 p-3">
                  <div className="bg-muted-foreground/20 h-10 w-10 flex-shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted-foreground/20 h-4 w-1/2 rounded" />
                    <div className="bg-muted-foreground/20 h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : profileData?.householdMembers && profileData.householdMembers.length > 0 ? (
            <div className="space-y-2">
              {profileData.householdMembers.map((member) => (
                <button
                  key={member.contactId}
                  onClick={() => {
                    // Open ProfileSheet to edit this member
                    setProfileSheetOpen(true);
                  }}
                  className="bg-muted hover:bg-muted-foreground/20 flex w-full items-center gap-3 p-3 text-left transition-all"
                >
                  <div className="bg-muted-foreground/20 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            const memberInitials = `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}`;
                            parent.innerHTML = memberInitials
                              ? `<span class="text-sm font-medium text-muted-foreground">${memberInitials}</span>`
                              : '<svg class="text-muted-foreground h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                          }
                        }}
                      />
                    ) : (
                      <User className="text-muted-foreground h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-medium">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {member.position}
                      {member.age && ` · Age ${member.age}`}
                    </p>
                  </div>
                  <ChevronRight className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No other household members found.</p>
          )}

          <button
            onClick={() => {
              alert('Add household member coming soon!');
            }}
            className="border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground mt-3 flex w-full items-center justify-center gap-2 border border-dashed px-4 py-3 text-sm font-medium transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Household Member
          </button>
        </section>

        {/* My Stuff Section */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
            My Stuff
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {MY_STUFF_ITEMS.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.route}
                  onClick={() => router.push(buildUrl(item.route))}
                  className="bg-muted hover:bg-muted-foreground/20 flex items-center gap-3 rounded-lg p-4 text-left transition-all"
                >
                  <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <ItemIcon className="text-primary h-5 w-5" />
                  </div>
                  <span className="text-foreground text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Admin Tools */}
        {isAdmin && (
          <section className="bg-card rounded-xl border p-6 shadow-sm">
            <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
              Admin Tools
            </h3>
            <button
              onClick={() => setImpersonateModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 bg-amber-500/20 px-4 py-3 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-500/30 dark:text-amber-300"
            >
              <UserSearch className="h-4 w-4" />
              Impersonate User
            </button>
          </section>
        )}

        {/* Theme Toggle + Sign Out */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 dark:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </section>
      </div>

      {/* ProfileSheet for editing */}
      <ProfileSheet
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        firstName={session?.firstName}
        lastName={session?.lastName}
        email={session?.email}
        image={session?.image}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
      />

      {/* Impersonate Modal */}
      <ImpersonateModal open={impersonateModalOpen} onOpenChange={setImpersonateModalOpen} />
    </>
  );
}
