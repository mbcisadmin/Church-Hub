'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LogOut,
  UserSearch,
  User,
  UserPlus,
  ChevronRight,
  Pencil,
  MapPin,
  Check,
  X,
  Camera,
} from 'lucide-react';
import {
  ResponsiveSheet,
  SheetPage,
  useResponsiveSheet,
} from '@church/nextjs-ui/components/ResponsiveSheet';
import ImpersonateModal from '@/components/ImpersonateModal';

const BRAND_GREEN_GRADIENT = 'var(--brand-gradient)';

interface ProfileSheetProps {
  open: boolean;
  onClose: () => void;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string | null;
  isAdmin?: boolean;
  onSignOut: () => void;
}

// Types for edit state
interface PersonToEdit {
  id: number | 'self';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

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

// Header component with user info and edit button
function ProfileHeader({
  firstName,
  lastName,
  email,
  image,
  onEdit,
  onSignOut,
  onClose,
}: {
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string | null;
  onEdit: () => void;
  onSignOut: () => void;
  onClose: () => void;
}) {
  const { mode } = useResponsiveSheet();
  const isModal = mode === 'modal';
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'User';
  const initials = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();

  return (
    <div
      className="relative overflow-hidden px-4 pt-4 pb-8 md:px-8 md:pt-6 md:pb-8"
      style={{ background: BRAND_GREEN_GRADIENT }}
    >
      {/* Mobile drag handle */}
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>

      {/* User icon watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <User className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Large centered avatar with border */}
        <div className="relative">
          <div className="rounded-full border-2 border-white/30 p-1">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/20">
              {image ? (
                <img
                  src={image}
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
          {/* Edit button on avatar */}
          <button
            onClick={onEdit}
            className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition-colors hover:bg-gray-100"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        {/* Name */}
        <h4 className="mt-4 text-lg font-semibold text-white">{displayName}</h4>

        {/* Email */}
        {email && <p className="mt-1 text-sm text-white/70">{email}</p>}
      </div>
    </div>
  );
}

// Edit page header with avatar
function EditHeader({
  personName,
  image,
  initials,
  onChangePhoto,
}: {
  personName: string;
  image?: string | null;
  initials: string;
  onChangePhoto: () => void;
}) {
  return (
    <div
      className="relative overflow-hidden px-4 pt-3 pb-6 md:px-8 md:pt-6 md:pb-8"
      style={{ background: BRAND_GREEN_GRADIENT }}
    >
      {/* Mobile drag handle */}
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>

      {/* Pencil icon watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <Pencil className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Avatar with edit overlay */}
        <div className="relative">
          <button
            onClick={onChangePhoto}
            className="group relative rounded-full border-2 border-white/30 p-1"
          >
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/20">
              {image ? (
                <img
                  src={image}
                  alt={personName}
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
            {/* Edit overlay on hover */}
            <div className="absolute inset-1 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Pencil className="h-6 w-6 text-white" />
            </div>
          </button>
          {/* Camera badge */}
          <div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg">
            <Camera className="h-4 w-4" />
          </div>
        </div>

        {/* Label */}
        <p className="mt-4 text-xs font-bold tracking-wider text-white/70 uppercase">
          Edit Profile
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-white md:text-2xl">
          {personName}
        </h2>
      </div>
    </div>
  );
}

// Main page content
function MainPageContent({
  isAdmin,
  onOpenImpersonate,
  onClose,
  onEditPerson,
  onSignOut,
  profileData,
  isLoadingProfile,
}: {
  isAdmin?: boolean;
  onOpenImpersonate: () => void;
  onClose: () => void;
  onEditPerson: (person: PersonToEdit) => void;
  onSignOut: () => void;
  profileData: ProfileData | null;
  isLoadingProfile: boolean;
}) {
  const { navigate } = useResponsiveSheet();
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Default empty address for editing
  const emptyAddress = { line1: '', line2: '', city: '', state: '', zip: '' };

  // Convert API address to local format
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

  const handleEditMember = (member: HouseholdMember) => {
    onEditPerson({
      id: member.contactId,
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || undefined,
      phone: member.mobilePhone || undefined,
      relationship: member.position || undefined,
    });
    navigate('edit');
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
    // TODO: Save to backend via API
    setIsEditingAddress(false);
    console.log('Saving address:', editedAddress);
    alert('Address saving coming soon!');
  };

  const handleCancelAddressEdit = () => {
    setEditedAddress(currentAddress);
    setIsEditingAddress(false);
  };

  return (
    <div className="bg-card space-y-6 p-6">
      {/* Address Section */}
      <div>
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
      </div>

      {/* Household Section */}
      <div>
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
                onClick={() => handleEditMember(member)}
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
                          const initials = `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}`;
                          parent.innerHTML = initials
                            ? `<span class="text-sm font-medium text-muted-foreground">${initials}</span>`
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
                    {member.age && ` • Age ${member.age}`}
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground h-5 w-5 flex-shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No other household members found.</p>
        )}

        {/* Add Member button */}
        <button
          onClick={() => {
            // TODO: Implement add household member flow
            alert('Add household member coming soon!');
          }}
          className="border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground mt-3 flex w-full items-center justify-center gap-2 border border-dashed px-4 py-3 text-sm font-medium transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add Household Member
        </button>
      </div>

      {/* Admin Tools */}
      {isAdmin && (
        <div>
          <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
            Admin Tools
          </h3>
          <button
            onClick={() => {
              onClose();
              onOpenImpersonate();
            }}
            className="flex w-full items-center justify-center gap-2 bg-amber-500/20 px-4 py-3 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-500/30 dark:text-amber-300"
          >
            <UserSearch className="h-4 w-4" />
            Impersonate User
          </button>
        </div>
      )}

      {/* Sign Out */}
      <div className="pt-2">
        <button
          onClick={() => {
            onClose();
            onSignOut();
          }}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 dark:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// Edit page content
function EditPageContent({ person }: { person: PersonToEdit | null }) {
  const [formData, setFormData] = useState({
    firstName: person?.firstName || '',
    lastName: person?.lastName || '',
    email: person?.email || '',
    phone: person?.phone || '',
  });

  if (!person) return null;

  const inputClass =
    'w-full bg-muted border-0 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none';

  const handleSave = () => {
    // TODO: Save to backend
    console.log('Saving person:', person.id, formData);
    alert('Profile updates coming soon!');
  };

  return (
    <div className="bg-card space-y-6 p-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Personal Information
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Contact Information
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 555-5555"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Relationship (for household members) */}
      {person.relationship && (
        <div>
          <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
            Relationship
          </h3>
          <div className="bg-muted text-muted-foreground px-4 py-3 text-sm">
            {person.relationship}
          </div>
          <p className="text-muted-foreground mt-1.5 text-xs">
            Relationship changes must be made in MinistryPlatform
          </p>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition-colors"
        style={{ background: BRAND_GREEN_GRADIENT }}
      >
        <Check className="h-4 w-4" />
        Save Changes
      </button>

      <p className="text-muted-foreground text-center text-xs italic">
        Profile editing coming soon...
      </p>
    </div>
  );
}

// Mock household data for demo purposes
const MOCK_HOUSEHOLD_MEMBERS: HouseholdMember[] = [
  {
    contactId: 1001,
    firstName: 'Sarah',
    lastName: 'Wirgau',
    position: 'Spouse',
    email: 'sarah.wirgau@gmail.com',
    mobilePhone: '(574) 555-0102',
    age: 32,
    imageUrl: null,
  },
  {
    contactId: 1002,
    firstName: 'Emma',
    lastName: 'Wirgau',
    position: 'Child',
    email: null,
    mobilePhone: null,
    age: 8,
    imageUrl: null,
  },
  {
    contactId: 1003,
    firstName: 'Noah',
    lastName: 'Wirgau',
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

export default function ProfileSheet({
  open,
  onClose,
  firstName,
  lastName,
  email,
  image,
  isAdmin,
  onSignOut,
}: ProfileSheetProps) {
  const [impersonateModalOpen, setImpersonateModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<PersonToEdit | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch profile data when sheet opens
  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    setProfileError(null);
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      // Use real data if available, otherwise use mock data for demo
      const hasRealData = data.householdMembers?.length > 0 || data.address?.line1;
      setProfileData({
        address: hasRealData ? data.address : MOCK_ADDRESS,
        householdMembers: hasRealData ? data.householdMembers : MOCK_HOUSEHOLD_MEMBERS,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use mock data on error for demo purposes
      setProfileData({
        address: MOCK_ADDRESS,
        householdMembers: MOCK_HOUSEHOLD_MEMBERS,
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (open && !profileData) {
      fetchProfile();
    }
  }, [open, profileData, fetchProfile]);

  const handleEditPerson = (person: PersonToEdit) => {
    setPersonToEdit(person);
  };

  // Get name for edit header
  const getEditPersonName = () => {
    if (!personToEdit) return '';
    if (personToEdit.id === 'self') {
      return [firstName, lastName].filter(Boolean).join(' ') || 'Your Profile';
    }
    return `${personToEdit.firstName} ${personToEdit.lastName}`;
  };

  return (
    <>
      <ResponsiveSheet
        open={open}
        onClose={onClose}
        panelClassName="bg-card overflow-hidden"
        maxWidth="max-w-3xl"
        noPanelPadding
        header={(ctx) => {
          if (ctx.currentPage === 'main') {
            return (
              <ProfileHeader
                firstName={firstName}
                lastName={lastName}
                email={email}
                image={image}
                onEdit={() => {
                  handleEditPerson({
                    id: 'self',
                    firstName: firstName || '',
                    lastName: lastName || '',
                    email: email,
                  });
                  ctx.navigate('edit');
                }}
                onSignOut={onSignOut}
                onClose={onClose}
              />
            );
          }
          if (ctx.currentPage === 'edit') {
            const editImage = personToEdit?.id === 'self' ? image : undefined;
            const editInitials = personToEdit
              ? `${personToEdit.firstName?.charAt(0) ?? ''}${personToEdit.lastName?.charAt(0) ?? ''}`.toUpperCase()
              : '';
            return (
              <EditHeader
                personName={getEditPersonName()}
                image={editImage}
                initials={editInitials}
                onChangePhoto={() => {
                  // TODO: Implement photo upload
                  alert('Photo upload coming soon!');
                }}
              />
            );
          }
          return null;
        }}
      >
        <SheetPage name="main">
          <MainPageContent
            isAdmin={isAdmin}
            onOpenImpersonate={() => setImpersonateModalOpen(true)}
            onClose={onClose}
            onEditPerson={(person) => {
              handleEditPerson(person);
              // Navigation happens via context in the component
            }}
            onSignOut={onSignOut}
            profileData={profileData}
            isLoadingProfile={isLoadingProfile}
          />
        </SheetPage>

        <SheetPage name="edit" title="Edit">
          <EditPageContent person={personToEdit} />
        </SheetPage>
      </ResponsiveSheet>

      {/* Impersonate Modal */}
      <ImpersonateModal open={impersonateModalOpen} onOpenChange={setImpersonateModalOpen} />
    </>
  );
}
