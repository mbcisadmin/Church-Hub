'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Mail,
  Phone,
  Loader2,
  X,
  ChevronRight,
  MapPin,
  CircleOff,
  Copy,
  Check,
  Send,
  MessageSquare,
  User,
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';
import {
  ResponsiveSheet,
  SheetPage,
  useResponsiveSheet,
} from '@church/nextjs-ui/components/ResponsiveSheet';
import { motion, AnimatePresence } from 'framer-motion';

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

// Header component for Email sheet with copy functionality
function EmailSheetHeader({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className="relative overflow-hidden px-4 pt-3 pb-6 md:px-8 md:pt-6 md:pb-8"
      style={{ background: BRAND_GREEN_GRADIENT }}
    >
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <Mail className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>
      <div className="relative z-10">
        <p className="mb-2 text-xs font-bold tracking-wider text-white/70 uppercase">Email</p>
        <button onClick={handleCopy} className="group flex items-center gap-2 text-left">
          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
            {copied ? 'Copied!' : email}
          </h2>
          {copied ? (
            <Check className="h-5 w-5 text-white" />
          ) : (
            <Copy className="h-5 w-5 text-white/50 transition-colors group-hover:text-white/80" />
          )}
        </button>
      </div>
    </div>
  );
}

// Header component for Phone sheet with copy functionality
function PhoneSheetHeader({
  phone,
  formatPhone,
}: {
  phone: string;
  formatPhone: (p: string | null) => string | null;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className="relative overflow-hidden px-4 pt-3 pb-6 md:px-8 md:pt-6 md:pb-8"
      style={{ background: BRAND_GREEN_GRADIENT }}
    >
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <Phone className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>
      <div className="relative z-10">
        <p className="mb-2 text-xs font-bold tracking-wider text-white/70 uppercase">Phone</p>
        <button onClick={handleCopy} className="group flex items-center gap-2 text-left">
          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
            {copied ? 'Copied!' : formatPhone(phone)}
          </h2>
          {copied ? (
            <Check className="h-5 w-5 text-white" />
          ) : (
            <Copy className="h-5 w-5 text-white/50 transition-colors group-hover:text-white/80" />
          )}
        </button>
      </div>
    </div>
  );
}

// Header component for Text sheet with copy functionality
function TextSheetHeader({
  phone,
  formatPhone,
}: {
  phone: string;
  formatPhone: (p: string | null) => string | null;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className="relative overflow-hidden px-4 pt-3 pb-6 md:px-8 md:pt-6 md:pb-8"
      style={{ background: BRAND_GREEN_GRADIENT }}
    >
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <MessageSquare className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>
      <div className="relative z-10">
        <p className="mb-2 text-xs font-bold tracking-wider text-white/70 uppercase">
          Text Message
        </p>
        <button onClick={handleCopy} className="group flex items-center gap-2 text-left">
          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
            {copied ? 'Copied!' : formatPhone(phone)}
          </h2>
          {copied ? (
            <Check className="h-5 w-5 text-white" />
          ) : (
            <Copy className="h-5 w-5 text-white/50 transition-colors group-hover:text-white/80" />
          )}
        </button>
      </div>
    </div>
  );
}

function PeopleSearchContent() {
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  // Copy to clipboard state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Set page title
  useEffect(() => {
    document.title = 'People Search - The Hub';
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (query: string, skip: number = 0) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setHasMore(true);
      return;
    }

    if (skip === 0) {
      setIsSearching(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const url = `/api/people-search/search?q=${encodeURIComponent(query)}&skip=${skip}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to search');
      const data = await response.json();

      if (skip === 0) {
        setSearchResults(data);
      } else {
        setSearchResults((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === 50);
    } catch (error) {
      console.error('Error searching contacts:', error);
      if (skip === 0) {
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Dismiss keyboard helper
  const dismissKeyboard = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  // Handle Enter key to dismiss keyboard
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        dismissKeyboard();
      }
    },
    [dismissKeyboard]
  );

  // Debounce search input and dismiss keyboard after typing stops
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      performSearch(searchQuery, 0);
    }, 500);

    // Dismiss keyboard 2 seconds after user stops typing (if query is valid)
    const keyboardTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        dismissKeyboard();
      }
    }, 2000);

    return () => {
      clearTimeout(searchTimer);
      clearTimeout(keyboardTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Handle scroll to load more
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

      if (bottom && hasMore && !isLoadingMore && !isSearching && searchResults.length > 0) {
        performSearch(searchQuery, searchResults.length);
      }
    },
    [hasMore, isLoadingMore, isSearching, searchResults.length, searchQuery, performSearch]
  );

  const handleSelectContact = async (contact: Contact) => {
    setShowDetailsPanel(true);
    setSelectedContact(contact);
    setIsLoadingDetails(true);
    setIsLoadingHousehold(true);
    setHousehold(null);
    setHouseholdMembers([]);

    try {
      // Load contact details
      const contactResponse = await fetch(`/api/people-search/${contact.Contact_ID}`);
      if (!contactResponse.ok) {
        throw new Error('Failed to fetch contact');
      }
      const contactData = await contactResponse.json();
      setSelectedContact(contactData);

      // Load household info if available
      if (contactData.Household_ID) {
        try {
          const householdResponse = await fetch(
            `/api/people-search/${contact.Contact_ID}/household`
          );
          if (!householdResponse.ok) {
            throw new Error('Failed to fetch household');
          }
          const householdData = await householdResponse.json();
          setHousehold(householdData.Household);
          setHouseholdMembers(householdData.Members || []);
        } catch (error) {
          console.error('Error loading household:', error);
          setHousehold(null);
          setHouseholdMembers([]);
        } finally {
          setIsLoadingHousehold(false);
        }
      } else {
        setIsLoadingHousehold(false);
      }
    } catch (error) {
      console.error('Error loading contact details:', error);
      setIsLoadingHousehold(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleClearSelection = useCallback(() => {
    setShowDetailsPanel(false);
    setSelectedContact(null);
    setHousehold(null);
    setHouseholdMembers([]);
    // Reset copied field after animation completes
    // Note: ResponsiveSheet handles page navigation reset automatically
    setTimeout(() => {
      setCopiedField(null);
    }, 300);
  }, []);

  // Prevent background scroll when details panel is open (desktop modal only)
  // Note: BottomSheet handles its own scroll lock for mobile
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (!isDesktop) return; // Let BottomSheet handle mobile

    if (showDetailsPanel) {
      const scrollY = window.scrollY;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      const scrollY = document.body.style.top;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    return () => {
      const scrollY = document.body.style.top;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    };
  }, [showDetailsPanel]);

  // Handle URL params on page load
  useEffect(() => {
    const query = searchParams.get('q');
    const contactId = searchParams.get('contactId');

    if (query) {
      setSearchQuery(query);
    }

    if (contactId) {
      setShowDetailsPanel(true);
      setIsLoadingDetails(true);
      setIsLoadingHousehold(true);

      const loadContact = async () => {
        try {
          const response = await fetch(`/api/people-search/${contactId}`);
          if (response.ok) {
            const contact = await response.json();
            await handleSelectContact(contact);
          } else {
            setShowDetailsPanel(false);
            setIsLoadingDetails(false);
            setIsLoadingHousehold(false);
          }
        } catch (error) {
          console.error('Error loading contact from URL:', error);
          setShowDetailsPanel(false);
          setIsLoadingDetails(false);
          setIsLoadingHousehold(false);
        }
      };
      loadContact();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const formatPhone = (phone: string | null) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

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

  const getDisplayName = (contact: Contact) => {
    if (contact.Company && contact.Company_Name) {
      return contact.Company_Name;
    }
    const firstName = contact.Nickname || contact.First_Name || '';
    return `${firstName} ${contact.Last_Name}`.trim();
  };

  const isInactive = (contact: Contact) => {
    return contact.Contact_Status_ID === 2;
  };

  return (
    <div className="bg-background pt-8 pb-8 md:pt-16">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6">
        {/* Header */}
        <SectionHeader
          title="People Search"
          subtitle="Look up contacts and view their information"
          icon={Search}
          variant="watermark"
          as="h1"
        />

        {/* Main Content */}
        <div className="mx-auto max-w-2xl">
          {/* Search Section */}
          <div className="space-y-10">
            {/* Search Input */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="">
              <h3 className="text-muted-foreground mb-4 text-xs font-semibold tracking-wide uppercase">
                Search
              </h3>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Enter name, email, or phone number..."
                  autoComplete="off"
                  enterKeyHint="search"
                  className="border-border bg-background focus:ring-primary h-12 w-full border px-4 text-base outline-none focus:border-transparent focus:ring-2"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Search Results */}
            <AnimatePresence>
              {(isSearching || searchResults.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className=""
                >
                  <h3 className="text-muted-foreground mb-4 text-xs font-semibold tracking-wide uppercase">
                    Results {!isSearching && `(${searchResults.length}${hasMore ? '+' : ''})`}
                  </h3>

                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="text-primary h-6 w-6 animate-spin" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center">No contacts found</div>
                  ) : (
                    <div className="space-y-3" onScroll={handleScroll}>
                      {searchResults.map((contact) => {
                        const inactive = isInactive(contact);
                        return (
                          <button
                            key={contact.Contact_ID}
                            onClick={() => handleSelectContact(contact)}
                            className={`flex w-full items-start gap-3 border p-4 text-left transition-all ${
                              selectedContact?.Contact_ID === contact.Contact_ID
                                ? 'border-foreground bg-background hover:bg-background'
                                : 'border-border hover:border-muted-foreground/50'
                            } ${inactive ? 'opacity-60' : ''}`}
                          >
                            <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
                              {getImageUrl(contact.Image_GUID) ? (
                                <img
                                  src={getImageUrl(contact.Image_GUID)!}
                                  alt={getDisplayName(contact)}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const parent = (e.target as HTMLImageElement).parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<span class="text-sm font-medium text-muted-foreground">${getInitials(contact)}</span>`;
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-muted-foreground text-sm font-medium">
                                  {getInitials(contact)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`font-semibold ${inactive ? 'text-muted-foreground' : 'text-foreground'}`}
                                  >
                                    {getDisplayName(contact)}
                                  </p>
                                  {contact.Email_Address && (
                                    <p className="text-muted-foreground truncate text-xs">
                                      {contact.Email_Address}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                              </div>
                              {(inactive || contact.Congregation_Name) && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {inactive && (
                                    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                                      <CircleOff className="h-3 w-3" />
                                      Inactive
                                    </span>
                                  )}
                                  {contact.Congregation_Name && (
                                    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                                      <MapPin className="h-3 w-3" />
                                      {contact.Congregation_Name}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      {isLoadingMore && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="text-primary h-5 w-5 animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Contact Details - Responsive Sheet (mobile bottom sheet, desktop modal) */}
        <ResponsiveSheet
          open={showDetailsPanel}
          onClose={handleClearSelection}
          panelClassName="bg-card overflow-hidden"
          maxWidth="max-w-3xl"
          noPanelPadding
          sheetMaxHeight="75dvh"
          header={(ctx) =>
            ctx.currentPage === 'main' ? (
              <ContactDetailsContent
                selectedContact={selectedContact}
                household={household}
                isLoadingHousehold={isLoadingHousehold}
                householdMembers={householdMembers}
                getImageUrl={getImageUrl}
                getInitials={getInitials}
                getDisplayName={getDisplayName}
                isInactive={isInactive}
                onSelectContact={handleSelectContact}
                onNavigateEmail={() => ctx.navigate('email')}
                onNavigatePhone={() => ctx.navigate('phone')}
                section="contactInfo"
              />
            ) : ctx.currentPage === 'email' ? (
              <EmailSheetHeader email={selectedContact?.Email_Address || ''} />
            ) : ctx.currentPage === 'phone' ? (
              <PhoneSheetHeader
                phone={selectedContact?.Mobile_Phone || ''}
                formatPhone={formatPhone}
              />
            ) : ctx.currentPage === 'text' ? (
              <TextSheetHeader
                phone={selectedContact?.Mobile_Phone || ''}
                formatPhone={formatPhone}
              />
            ) : null
          }
        >
          {/* Main Page - Household info */}
          <SheetPage name="main">
            <MainPageContent
              selectedContact={selectedContact}
              household={household}
              isLoadingHousehold={isLoadingHousehold}
              householdMembers={householdMembers}
              getImageUrl={getImageUrl}
              getInitials={getInitials}
              getDisplayName={getDisplayName}
              isInactive={isInactive}
              onSelectContact={handleSelectContact}
            />
          </SheetPage>

          {/* Email Page */}
          <SheetPage name="email" title="Email">
            <EmailPageContent email={selectedContact?.Email_Address || ''} />
          </SheetPage>

          {/* Phone Page */}
          <SheetPage name="phone" title="Phone">
            <PhonePageContent phone={selectedContact?.Mobile_Phone || ''} />
          </SheetPage>

          {/* Text Page */}
          <SheetPage name="text" title="Text">
            <TextPageContent phone={selectedContact?.Mobile_Phone || ''} />
          </SheetPage>
        </ResponsiveSheet>
      </div>
    </div>
  );
}

// Contact Details Content Component (shared between mobile and desktop)
function ContactDetailsContent({
  selectedContact,
  isLoadingHousehold,
  household,
  householdMembers,
  getImageUrl,
  getInitials,
  getDisplayName,
  isInactive,
  onSelectContact,
  onNavigateEmail,
  onNavigatePhone,
  section = 'all',
}: {
  selectedContact: Contact | null;
  isLoadingDetails?: boolean;
  household: Household | null;
  isLoadingHousehold: boolean;
  householdMembers: HouseholdMember[];
  formatPhone?: (phone: string | null) => string | null;
  getImageUrl: (guid: string | null | undefined) => string | null;
  getInitials: (contact: Contact) => string;
  getDisplayName: (contact: Contact) => string;
  isInactive: (contact: Contact) => boolean;
  onSelectContact: (contact: Contact) => void;
  onNavigateEmail?: () => void;
  onNavigatePhone?: () => void;
  /** Which section to render: 'all', 'contactInfo' (header), or 'household' (scrollable) */
  section?: 'all' | 'contactInfo' | 'household';
}) {
  const { mode } = useResponsiveSheet();
  const isModal = mode === 'modal';
  const [copiedAddress, setCopiedAddress] = useState(false);

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const showContactInfo = section === 'all' || section === 'contactInfo';
  const showHousehold = section === 'all' || section === 'household';

  // Wrapper class varies by section
  const wrapperClass =
    section === 'all'
      ? 'bg-card max-h-[70vh] space-y-6 overflow-y-auto p-6'
      : section === 'contactInfo'
        ? 'relative overflow-hidden px-4 pt-3 pb-6 md:px-8 md:pt-6 md:pb-8'
        : 'bg-card p-6';

  // Contact info header uses brand green gradient
  const wrapperStyle = section === 'contactInfo' ? { background: BRAND_GREEN_GRADIENT } : undefined;

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      {selectedContact ? (
        <>
          {/* Contact Info Section - Centered with brand green header */}
          {showContactInfo && (
            <>
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
                <div className="rounded-full border-2 border-white/30 p-1">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/20">
                    {getImageUrl(selectedContact.Image_GUID) ? (
                      <img
                        src={getImageUrl(selectedContact.Image_GUID)!}
                        alt={getDisplayName(selectedContact)}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-2xl font-semibold text-white">${getInitials(selectedContact)}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-white">
                        {getInitials(selectedContact)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h4 className="mt-4 text-lg font-semibold text-white">
                  {getDisplayName(selectedContact)}
                </h4>

                {/* Age and Status */}
                <div className="mt-1 flex items-center gap-2">
                  {selectedContact.__Age && (
                    <span className="text-sm text-white/70">Age {selectedContact.__Age}</span>
                  )}
                  {isInactive(selectedContact) && (
                    <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white/70 uppercase">
                      <CircleOff className="h-3 w-3" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Contact buttons - responsive: circular icons on mobile, text buttons on desktop */}
              {selectedContact.Email_Address &&
                (onNavigateEmail ? (
                  <button
                    onClick={onNavigateEmail}
                    className={`absolute z-20 flex items-center justify-center bg-white/20 text-white transition-colors hover:bg-white/30 ${
                      isModal
                        ? 'bottom-4 left-4 gap-2 px-3 py-1.5 text-sm font-medium'
                        : 'top-8 left-4 h-11 w-11 rounded-full'
                    }`}
                  >
                    <Mail className={isModal ? 'h-4 w-4' : 'h-5 w-5'} />
                    {isModal && <span>Email</span>}
                  </button>
                ) : (
                  <a
                    href={`mailto:${selectedContact.Email_Address}`}
                    className={`absolute z-20 flex items-center justify-center bg-white/20 text-white transition-colors hover:bg-white/30 ${
                      isModal
                        ? 'bottom-4 left-4 gap-2 px-3 py-1.5 text-sm font-medium'
                        : 'top-8 left-4 h-11 w-11 rounded-full'
                    }`}
                  >
                    <Mail className={isModal ? 'h-4 w-4' : 'h-5 w-5'} />
                    {isModal && <span>Email</span>}
                  </a>
                ))}
              {selectedContact.Mobile_Phone &&
                (onNavigatePhone ? (
                  <button
                    onClick={onNavigatePhone}
                    className={`absolute z-20 flex items-center justify-center bg-white/20 text-white transition-colors hover:bg-white/30 ${
                      isModal
                        ? 'right-4 bottom-4 gap-2 px-3 py-1.5 text-sm font-medium'
                        : 'top-8 right-4 h-11 w-11 rounded-full'
                    }`}
                  >
                    <Phone className={isModal ? 'h-4 w-4' : 'h-5 w-5'} />
                    {isModal && <span>Phone</span>}
                  </button>
                ) : (
                  <a
                    href={`tel:${selectedContact.Mobile_Phone}`}
                    className={`absolute z-20 flex items-center justify-center bg-white/20 text-white transition-colors hover:bg-white/30 ${
                      isModal
                        ? 'right-4 bottom-4 gap-2 px-3 py-1.5 text-sm font-medium'
                        : 'top-8 right-4 h-11 w-11 rounded-full'
                    }`}
                  >
                    <Phone className={isModal ? 'h-4 w-4' : 'h-5 w-5'} />
                    {isModal && <span>Phone</span>}
                  </a>
                ))}
            </>
          )}

          {/* Household Section */}
          {showHousehold && (selectedContact.Household_ID || isLoadingHousehold) && (
            <div className={section === 'household' ? '' : 'border-border border-t pt-6'}>
              <h3 className="text-muted-foreground mb-4 text-xs font-semibold tracking-wide uppercase">
                Household
              </h3>

              {isLoadingHousehold ? (
                <div className="animate-pulse space-y-4">
                  {/* Address skeleton with pin icon placeholder */}
                  <div className="flex items-start gap-2">
                    <div className="bg-muted mt-0.5 h-4 w-4 rounded"></div>
                    <div className="bg-muted h-4 w-56 rounded"></div>
                  </div>

                  {/* Member row skeletons */}
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
                  {/* Address with pin icon - clickable to copy */}
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
                      (m) => m.Contact_ID !== selectedContact?.Contact_ID
                    );
                    if (otherMembers.length === 0) return null;

                    return (
                      <div className="space-y-2">
                        {otherMembers.map((member) => (
                          <button
                            key={member.Contact_ID}
                            onClick={() => onSelectContact(member)}
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
                                      parent.innerHTML = `<span class="text-sm font-medium text-muted-foreground">${getInitials(member)}</span>`;
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-muted-foreground text-sm font-medium">
                                  {getInitials(member)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-foreground font-medium">
                                {getDisplayName(member)}
                              </p>
                              {(member.__Age || member.Household_Position) && (
                                <p className="text-muted-foreground text-xs">
                                  {member.Household_Position}
                                  {member.Household_Position && member.__Age && ' • '}
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
        </>
      ) : null}
    </div>
  );
}

// Page content components that use ResponsiveSheet context
function MainPageContent({
  selectedContact,
  household,
  isLoadingHousehold,
  householdMembers,
  getImageUrl,
  getInitials,
  getDisplayName,
  isInactive,
  onSelectContact,
}: {
  selectedContact: Contact | null;
  isLoadingDetails?: boolean;
  household: Household | null;
  isLoadingHousehold: boolean;
  householdMembers: HouseholdMember[];
  formatPhone?: (phone: string | null) => string | null;
  getImageUrl: (guid: string | null | undefined) => string | null;
  getInitials: (contact: Contact | HouseholdMember) => string;
  getDisplayName: (contact: Contact | HouseholdMember) => string;
  isInactive: (contact: Contact) => boolean;
  onSelectContact: (contact: Contact) => void;
}) {
  return (
    <ContactDetailsContent
      selectedContact={selectedContact}
      household={household}
      isLoadingHousehold={isLoadingHousehold}
      householdMembers={householdMembers}
      getImageUrl={getImageUrl}
      getInitials={getInitials}
      getDisplayName={getDisplayName}
      isInactive={isInactive}
      onSelectContact={onSelectContact}
      section="household"
    />
  );
}

function EmailPageContent({ email }: { email: string }) {
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [formData, setFormData] = useState({
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });

  const handleSend = () => {
    // Build mailto URL with all fields
    const params = new URLSearchParams();
    if (formData.cc) params.set('cc', formData.cc);
    if (formData.bcc) params.set('bcc', formData.bcc);
    if (formData.subject) params.set('subject', formData.subject);
    if (formData.body) params.set('body', formData.body);

    const mailtoUrl = `mailto:${email}${params.toString() ? '?' + params.toString() : ''}`;
    window.location.href = mailtoUrl;
  };

  const inputClass =
    'w-full bg-muted border-0 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none';

  return (
    <div className="bg-card space-y-4 p-6">
      {/* To field - read only */}
      <div>
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
          To
        </label>
        <div className="bg-muted text-foreground flex items-center gap-2 px-4 py-3">
          <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{email}</span>
        </div>
      </div>

      {/* CC/BCC toggle */}
      {!showCcBcc ? (
        <button
          onClick={() => setShowCcBcc(true)}
          className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
        >
          + Add CC/BCC
        </button>
      ) : (
        <div className="space-y-4">
          {/* CC field */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
              CC
            </label>
            <input
              type="email"
              value={formData.cc}
              onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
              placeholder="email@example.com"
              className={inputClass}
            />
          </div>

          {/* BCC field */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
              BCC
            </label>
            <input
              type="email"
              value={formData.bcc}
              onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
              placeholder="email@example.com"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Subject field */}
      <div>
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
          Subject
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Enter subject..."
          className={inputClass}
        />
      </div>

      {/* Body field */}
      <div>
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
          Message
        </label>
        <textarea
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          placeholder="Write your message..."
          rows={5}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition-colors"
        style={{ background: BRAND_GREEN_GRADIENT }}
      >
        <Send className="h-4 w-4" />
        Send Email
      </button>
    </div>
  );
}

function PhonePageContent({ phone }: { phone: string }) {
  const { navigate } = useResponsiveSheet();
  const buttonClass = 'bg-muted text-foreground hover:bg-muted/80';

  return (
    <div className="bg-card p-6">
      <div className="flex gap-3">
        <a
          href={`tel:${phone}`}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${buttonClass}`}
        >
          <Phone className="h-4 w-4" />
          Call
        </a>

        <button
          onClick={() => navigate('text')}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${buttonClass}`}
        >
          <MessageSquare className="h-4 w-4" />
          Text
        </button>
      </div>
    </div>
  );
}

function TextPageContent({ phone }: { phone: string }) {
  const [message, setMessage] = useState('');

  const inputClass =
    'w-full bg-muted border-0 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none';

  // Build SMS URL with message body
  const getSmsUrl = () => {
    if (message) {
      // Use &body= for iOS and ?body= as fallback
      return `sms:${phone}&body=${encodeURIComponent(message)}`;
    }
    return `sms:${phone}`;
  };

  return (
    <div className="bg-card space-y-4 p-6">
      {/* Message field */}
      <div>
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          onClick={() => {
            console.log('In-app SMS via platform - to be implemented');
            alert('In-app texting via church number coming soon!');
          }}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition-colors"
          style={{ background: BRAND_GREEN_GRADIENT }}
        >
          <MessageSquare className="h-4 w-4" />
          Text from Church Number
        </button>

        <a
          href={getSmsUrl()}
          className="border-border text-foreground hover:bg-muted flex w-full items-center justify-center gap-2 border bg-transparent px-4 py-3 text-sm font-medium transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          Text from Personal Number
        </a>
      </div>
    </div>
  );
}

export default function PeopleSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex h-64 items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <PeopleSearchContent />
    </Suspense>
  );
}
