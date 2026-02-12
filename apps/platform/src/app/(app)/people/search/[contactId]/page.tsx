'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  ChevronLeft,
  Mail,
  Phone,
  User,
  MapPin,
  Copy,
  Check,
  CircleOff,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

type Contact = {
  Contact_ID: number;
  First_Name: string | null;
  Last_Name: string;
  Nickname: string | null;
  Display_Name: string;
  Email_Address: string | null;
  Mobile_Phone: string | null;
  Company_Phone: string | null;
  Date_of_Birth: string | null;
  Gender_ID: number | null;
  Marital_Status_ID: number | null;
  Household_ID: number | null;
  Household_Position_ID: number | null;
  Participant_Record: number | null;
  Company: boolean | null;
  Company_Name: string | null;
  __Age: number | null;
  Contact_Status_ID: number | null;
  Image_GUID?: string | null;
  Congregation_ID?: number | null;
  Congregation_Name?: string | null;
};

type HouseholdMember = Contact & {
  Household_Position?: string | null;
  Gender?: string | null;
};

type Household = {
  Household_ID: number;
  Household_Name: string;
  Congregation_Name?: string | null;
  Home_Phone: string | null;
  Address?: {
    Address_ID: number;
    Address_Line_1?: string | null;
    Address_Line_2?: string | null;
    City?: string | null;
    State?: string | null;
    Postal_Code?: string | null;
    Country?: string | null;
    Latitude?: number | null;
    Longitude?: number | null;
  } | null;
};

const BRAND_GREEN_GRADIENT = 'var(--brand-gradient)';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.contactId as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    document.title = 'Contact Details - The Hub';
  }, []);

  useEffect(() => {
    const loadContact = async () => {
      try {
        const response = await fetch(`/api/people-search/${contactId}`);
        if (!response.ok) throw new Error('Failed to load contact');
        const data = await response.json();
        setContact(data);

        // Load household if available
        if (data.Household_ID) {
          setIsLoadingHousehold(true);
          try {
            const householdResponse = await fetch(`/api/people-search/${contactId}/household`);
            if (householdResponse.ok) {
              const householdData = await householdResponse.json();
              setHousehold(householdData.Household);
              setHouseholdMembers(householdData.Members || []);
            }
          } catch (error) {
            console.error('Error loading household:', error);
          } finally {
            setIsLoadingHousehold(false);
          }
        }
      } catch (error) {
        console.error('Error loading contact:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContact();
  }, [contactId]);

  const getImageUrl = (imageGuidOrUrl: string | null | undefined) => {
    if (!imageGuidOrUrl) return null;
    if (imageGuidOrUrl.startsWith('http')) return imageGuidOrUrl;
    return `${process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL}/${imageGuidOrUrl}?$thumbnail=true`;
  };

  const getInitials = (contact: Contact) => {
    if (contact.Company && contact.Company_Name) {
      return contact.Company_Name.substring(0, 2).toUpperCase();
    }
    const firstName = contact.Nickname || contact.First_Name || '';
    const lastName = contact.Last_Name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getDisplayName = (contact: Contact | HouseholdMember) => {
    if ('Company' in contact && contact.Company && contact.Company_Name) {
      return contact.Company_Name;
    }
    const firstName = contact.Nickname || contact.First_Name || '';
    return `${firstName} ${contact.Last_Name}`.trim();
  };

  const isInactive = (contact: Contact) => {
    return contact.Contact_Status_ID === 2;
  };

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Contact not found</p>
        <button
          onClick={() => router.push('/people/search')}
          className="text-primary hover:underline"
        >
          Back to People Search
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header with contact info */}
      <div
        className="relative overflow-hidden px-4 pt-4 pb-8 md:px-8 md:pt-6 md:pb-10"
        style={{ background: BRAND_GREEN_GRADIENT }}
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="group mb-6 flex items-center gap-2 text-white/70 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* User icon watermark */}
        <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
          <User className="h-32 w-32 text-white opacity-10 md:h-48 md:w-48" />
        </div>

        {/* Contact info */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Large centered avatar with border */}
          <div className="rounded-full border-2 border-white/30 p-1">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/20">
              {getImageUrl(contact.Image_GUID) ? (
                <img
                  src={getImageUrl(contact.Image_GUID)!}
                  alt={getDisplayName(contact)}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-3xl font-semibold text-white">${getInitials(contact)}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-3xl font-semibold text-white">{getInitials(contact)}</span>
              )}
            </div>
          </div>

          {/* Name */}
          <h1 className="mt-4 text-2xl font-bold text-white">{getDisplayName(contact)}</h1>

          {/* Age and Status */}
          <div className="mt-2 flex items-center gap-2">
            {contact.__Age && <span className="text-sm text-white/70">Age {contact.__Age}</span>}
            {isInactive(contact) && (
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/70 uppercase">
                <CircleOff className="h-3 w-3" />
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* Contact action buttons */}
        {contact.Email_Address && (
          <button
            onClick={() => router.push(`/people/search/${contactId}/email`)}
            className="absolute bottom-4 left-4 z-20 flex items-center justify-center gap-2 bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
          >
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </button>
        )}
        {contact.Mobile_Phone && (
          <button
            onClick={() => router.push(`/people/search/${contactId}/phone`)}
            className="absolute right-4 bottom-4 z-20 flex items-center justify-center gap-2 bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
          >
            <Phone className="h-4 w-4" />
            <span>Phone</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl p-6">
        {/* Household Section */}
        {(contact.Household_ID || isLoadingHousehold) && (
          <div>
            <h2 className="text-muted-foreground mb-4 text-xs font-semibold tracking-wide uppercase">
              Household
            </h2>

            {isLoadingHousehold ? (
              <div className="animate-pulse space-y-4">
                <div className="flex items-start gap-2">
                  <div className="bg-muted mt-0.5 h-4 w-4 rounded"></div>
                  <div className="bg-muted h-4 w-56 rounded"></div>
                </div>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-muted flex items-center gap-3 p-3">
                      <div className="bg-muted-foreground/20 h-10 w-10 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="bg-muted-foreground/20 h-4 w-32 rounded"></div>
                        <div className="bg-muted-foreground/20 h-3 w-24 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : household ? (
              <div className="space-y-4">
                {/* Address */}
                {household.Address?.Address_Line_1 &&
                  (() => {
                    const fullAddress = `${household.Address.Address_Line_1}${household.Address.City ? `, ${household.Address.City}, ${household.Address.State} ${household.Address.Postal_Code}` : ''}`;
                    return (
                      <button
                        onClick={() => copyAddress(fullAddress)}
                        className={`-mx-2 flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors ${copiedAddress ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        {copiedAddress ? (
                          <Check className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="flex-1 text-sm">
                          {copiedAddress ? 'Copied!' : fullAddress}
                        </span>
                        {!copiedAddress && (
                          <Copy className="h-3.5 w-3.5 flex-shrink-0 opacity-40" />
                        )}
                      </button>
                    );
                  })()}

                {/* Household Members */}
                {(() => {
                  const otherMembers = householdMembers.filter(
                    (m) => m.Contact_ID !== contact?.Contact_ID
                  );
                  if (otherMembers.length === 0) return null;

                  return (
                    <div className="space-y-2">
                      {otherMembers.map((member) => (
                        <button
                          key={member.Contact_ID}
                          onClick={() => router.push(`/people/search/${member.Contact_ID}`)}
                          className="bg-muted hover:bg-muted-foreground/20 flex w-full items-center gap-3 p-3 text-left transition-all"
                        >
                          <div className="bg-muted-foreground/20 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
                            {getImageUrl(member.Image_GUID) ? (
                              <img
                                src={getImageUrl(member.Image_GUID)!}
                                alt={getDisplayName(member)}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const parent = (e.target as HTMLImageElement).parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<span class="text-sm font-medium text-muted-foreground">${member.Nickname?.charAt(0) || member.First_Name?.charAt(0) || ''}${member.Last_Name?.charAt(0) || ''}</span>`;
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-muted-foreground text-sm font-medium">
                                {member.Nickname?.charAt(0) || member.First_Name?.charAt(0) || ''}
                                {member.Last_Name?.charAt(0) || ''}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground font-medium">{getDisplayName(member)}</p>
                            {(member.__Age || member.Household_Position) && (
                              <p className="text-muted-foreground text-xs">
                                {member.Household_Position}
                                {member.Household_Position && member.__Age && ' · '}
                                {member.__Age && `Age ${member.__Age}`}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
