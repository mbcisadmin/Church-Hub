'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Mail,
  Search,
  Send,
  FileText,
  Users,
  Rocket,
  PenSquare,
  Inbox,
  BarChart3,
  Layers,
  Star,
  Paperclip,
  MailOpen,
  X,
  MessageSquare,
  Bell,
  BellOff,
  Target,
  Check,
  Settings2,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import {
  useRegisterPageActions,
  DesktopActionBar,
  type PageActionDef,
} from '@church/nextjs-ui/page-actions';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import ChurchLogo from '@/components/ChurchLogo';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { useContactActions } from '@/components/ContactActionProvider';

type MessagesTab = 'inbox' | 'sent';

// ============================================================================
// Mock Data
// ============================================================================

const INBOX_MESSAGES = [
  {
    id: '1',
    sender: 'General News & Updates',
    senderType: 'publication' as const,
    publicationId: 'pub-1',
    subject: 'This Week at Church',
    preview:
      "Here's what's happening this week at church. Don't miss our special guest speaker this Sunday...",
    time: 'Today, 8:00 AM',
    date: 'Today',
    channel: 'email' as const,
    unread: true,
    starred: false,
    hasAttachment: false,
  },
  {
    id: '2',
    sender: 'Students Ministry',
    senderType: 'publication' as const,
    publicationId: 'pub-4',
    subject: 'Winter Retreat - Final Details!',
    preview:
      'Parents, here are the final details for the Winter Retreat happening Feb 21-23. Please make sure your student has...',
    time: 'Yesterday',
    date: 'Yesterday',
    channel: 'email' as const,
    unread: true,
    starred: true,
    hasAttachment: true,
  },
  {
    id: '3',
    sender: 'Guest Services Team',
    senderType: 'group' as const,
    publicationId: null,
    subject: '',
    preview: 'Reminder: Team meeting this Thursday at 6:30 PM in Room 204. See you there!',
    time: 'Yesterday',
    date: 'Yesterday',
    channel: 'text' as const,
    unread: false,
    starred: false,
    hasAttachment: false,
  },
  {
    id: '4',
    sender: 'Pastor Mike Chen',
    senderType: 'person' as const,
    publicationId: null,
    subject: 'Quick question about Sunday',
    preview:
      'Hey! Just wanted to check in about the schedule for this Sunday. Are you still available to help with...',
    time: 'Feb 7',
    date: 'Feb 7',
    channel: 'email' as const,
    unread: false,
    starred: false,
    hasAttachment: false,
  },
  {
    id: '5',
    sender: 'My Campus',
    senderType: 'publication' as const,
    publicationId: 'pub-2',
    subject: 'Campus Update - February',
    preview:
      'Hello church family! Here are the latest updates from your campus. We have some exciting things planned...',
    time: 'Feb 5',
    date: 'Feb 5',
    channel: 'email' as const,
    unread: false,
    starred: false,
    hasAttachment: false,
  },
  {
    id: '6',
    sender: 'Small Group Leaders',
    senderType: 'group' as const,
    publicationId: null,
    subject: '',
    preview: "Don't forget: Leader training this Saturday 9 AM. Breakfast provided!",
    time: 'Feb 4',
    date: 'Feb 4',
    channel: 'text' as const,
    unread: false,
    starred: false,
    hasAttachment: false,
  },
  {
    id: '7',
    sender: "Kid's Ministry",
    senderType: 'publication' as const,
    publicationId: 'pub-3',
    subject: 'February Kids Calendar',
    preview:
      "Check out what's happening in Kids Ministry this month! We have a special family event on the 15th...",
    time: 'Feb 1',
    date: 'Feb 1',
    channel: 'email' as const,
    unread: false,
    starred: false,
    hasAttachment: true,
  },
];

// Publications (for preferences panel)
const PUBLICATIONS = [
  { id: 'pub-1', name: 'General News & Updates', campus: null },
  { id: 'pub-2', name: 'My Campus', campus: 'Main' },
  { id: 'pub-3', name: "Kid's Ministry", campus: null },
  { id: 'pub-4', name: 'Students Ministry', campus: null },
  { id: 'pub-5', name: "Women's Ministry", campus: null },
  { id: 'pub-6', name: "Men's Ministry", campus: null },
  { id: 'pub-7', name: 'Missions Prayer Team', campus: null },
  { id: 'pub-8', name: 'Podcasts & Content', campus: null },
];

const SENT_MESSAGES = [
  {
    id: 's1',
    recipientType: 'publication' as const,
    recipientName: 'Students',
    recipientCount: 284,
    subject: 'Winter Retreat - Final Details!',
    channel: 'email' as const,
    sentAt: 'Yesterday, 2:00 PM',
    sentBy: 'You',
    opens: 186,
    delivered: 278,
    campus: 'All',
  },
  {
    id: 's2',
    recipientType: 'group' as const,
    recipientName: 'Guest Services Team',
    recipientCount: 24,
    subject: '',
    channel: 'text' as const,
    sentAt: 'Yesterday, 10:00 AM',
    sentBy: 'You',
    opens: null,
    delivered: 24,
    campus: null,
  },
  {
    id: 's3',
    recipientType: 'audience' as const,
    recipientName: 'New Visitors (Last 30 Days)',
    recipientCount: 47,
    subject: 'Welcome!',
    channel: 'email' as const,
    sentAt: 'Feb 5, 9:00 AM',
    sentBy: 'Communications',
    opens: 31,
    delivered: 45,
    campus: null,
  },
  {
    id: 's4',
    recipientType: 'group' as const,
    recipientName: 'Small Group Leaders',
    recipientCount: 35,
    subject: '',
    channel: 'text' as const,
    sentAt: 'Feb 4, 3:00 PM',
    sentBy: 'Pastor Sarah',
    opens: null,
    delivered: 35,
    campus: null,
  },
  {
    id: 's5',
    recipientType: 'publication' as const,
    recipientName: 'General News & Updates',
    recipientCount: 847,
    subject: 'This Week at Church',
    channel: 'email' as const,
    sentAt: 'Feb 3, 8:00 AM',
    sentBy: 'Communications',
    opens: 512,
    delivered: 831,
    campus: 'All',
  },
];

// Staff apps
const MESSAGES_APPS = [
  {
    id: 'templates',
    name: 'Templates',
    description: 'Browse and use pre-built message templates',
    icon: FileText,
    route: '/messages/templates',
  },
  {
    id: 'audiences',
    name: 'Audiences',
    description: 'Manage rule-based recipient lists',
    icon: Target,
    route: '/messages/audiences',
  },
  {
    id: 'campaigns',
    name: 'Campaigns',
    description: 'Create multi-step message sequences',
    icon: Layers,
    route: '/messages/campaigns',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Message performance and engagement data',
    icon: BarChart3,
    route: '/messages/analytics',
  },
];

// ============================================================================
// Components
// ============================================================================

function ChannelBadge({ channel }: { channel: 'email' | 'text' }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] leading-none font-semibold uppercase ${
        channel === 'email'
          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          : 'bg-green-500/10 text-green-600 dark:text-green-400'
      }`}
    >
      {channel === 'email' ? (
        <Mail className="h-2.5 w-2.5" />
      ) : (
        <MessageSquare className="h-2.5 w-2.5" />
      )}
      {channel}
    </span>
  );
}

function SenderTypeBadge({ type }: { type: 'publication' | 'group' | 'person' | 'audience' }) {
  const config = {
    publication: {
      label: 'Publication',
      className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    group: { label: 'Group', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    person: { label: 'Direct', className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
    audience: { label: 'Audience', className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  };
  const c = config[type];
  return (
    <span
      className={`rounded px-1 py-0.5 text-[9px] leading-none font-semibold uppercase ${c.className}`}
    >
      {c.label}
    </span>
  );
}

function InboxRow({
  message,
  isMuted,
  onToggleMute,
  onClick,
}: {
  message: (typeof INBOX_MESSAGES)[0];
  isMuted: boolean;
  onToggleMute: () => void;
  onClick: () => void;
}) {
  const isPublication = message.senderType === 'publication';

  return (
    <div
      className={`hover:bg-muted/50 group relative flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors ${
        message.unread ? 'bg-primary/[0.03]' : ''
      }`}
    >
      {/* Clickable main area */}
      <button
        onClick={onClick}
        className="absolute inset-0 z-0"
        aria-label={`Open message from ${message.sender}`}
      />

      {/* Unread indicator + icon */}
      <div className="relative z-10 mt-1 shrink-0">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            message.senderType === 'publication'
              ? isMuted
                ? 'bg-muted'
                : 'bg-purple-500/10'
              : message.senderType === 'group'
                ? 'bg-amber-500/10'
                : 'bg-sky-500/10'
          }`}
        >
          {message.senderType === 'publication' ? (
            isMuted ? (
              <BellOff className="text-muted-foreground h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4 text-purple-500" />
            )
          ) : message.senderType === 'group' ? (
            <Users className="h-4 w-4 text-amber-500" />
          ) : (
            <Mail className="h-4 w-4 text-sky-500" />
          )}
        </div>
        {message.unread && !isMuted && (
          <span className="absolute -top-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500 dark:border-gray-900" />
        )}
      </div>

      {/* Content */}
      <div className="z-10 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className={`truncate text-sm ${
                isMuted
                  ? 'text-muted-foreground font-medium'
                  : message.unread
                    ? 'text-foreground font-bold'
                    : 'text-foreground font-medium'
              }`}
            >
              {message.sender}
            </span>
            {isMuted && (
              <span className="text-muted-foreground/60 text-[9px] font-medium uppercase">
                Muted
              </span>
            )}
          </div>
          <span className="text-muted-foreground shrink-0 text-xs">{message.time}</span>
        </div>
        {message.subject && (
          <div className="flex items-center gap-1.5">
            {message.starred && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />}
            <span
              className={`truncate text-sm ${
                isMuted
                  ? 'text-muted-foreground'
                  : message.unread
                    ? 'text-foreground font-semibold'
                    : 'text-foreground/80'
              }`}
            >
              {message.subject}
            </span>
          </div>
        )}
        <p className="text-muted-foreground mt-0.5 truncate text-xs">{message.preview}</p>
        <div className="mt-1 flex items-center gap-2">
          <ChannelBadge channel={message.channel} />
          {message.hasAttachment && (
            <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
              <Paperclip className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>

      {/* Turn off / on updates button for publications */}
      {isPublication && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className={`z-10 mt-1 flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium transition-all ${
            isMuted
              ? 'bg-primary/10 text-primary hover:bg-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100'
          }`}
          aria-label={
            isMuted
              ? `Turn on updates from ${message.sender}`
              : `Turn off updates from ${message.sender}`
          }
        >
          {isMuted ? (
            <>
              <Bell className="h-3 w-3" />
              <span className="hidden sm:inline">Turn on</span>
            </>
          ) : (
            <>
              <BellOff className="h-3 w-3" />
              <span className="hidden sm:inline">Turn off</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

function SentRow({
  message,
  onClick,
}: {
  message: (typeof SENT_MESSAGES)[0];
  onClick: () => void;
}) {
  const openRate =
    message.opens != null && message.delivered
      ? Math.round((message.opens / message.delivered) * 100)
      : null;

  return (
    <button
      onClick={onClick}
      className="hover:bg-muted/50 flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors"
    >
      {/* Icon */}
      <div className="mt-1 shrink-0">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            message.recipientType === 'publication'
              ? 'bg-purple-500/10'
              : message.recipientType === 'audience'
                ? 'bg-rose-500/10'
                : 'bg-amber-500/10'
          }`}
        >
          {message.recipientType === 'publication' ? (
            <Bell className="h-4 w-4 text-purple-500" />
          ) : message.recipientType === 'audience' ? (
            <Target className="h-4 w-4 text-rose-500" />
          ) : (
            <Users className="h-4 w-4 text-amber-500" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground truncate text-sm font-medium">
            {message.recipientName}
          </span>
          <span className="text-muted-foreground shrink-0 text-xs">{message.sentAt}</span>
        </div>
        {message.subject && (
          <p className="text-foreground/80 truncate text-sm">{message.subject}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <ChannelBadge channel={message.channel} />
          <SenderTypeBadge type={message.recipientType} />
          <span className="text-muted-foreground text-[10px]">
            {message.recipientCount} recipients
          </span>
          {message.sentBy !== 'You' && (
            <span className="text-muted-foreground text-[10px]">by {message.sentBy}</span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Check className="text-muted-foreground h-3 w-3" />
            <span className="text-muted-foreground text-[10px]">{message.delivered} delivered</span>
          </div>
          {openRate != null && (
            <div className="flex items-center gap-1">
              <MailOpen className="text-muted-foreground h-3 w-3" />
              <span className="text-muted-foreground text-[10px]">{openRate}% opened</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function EmailPreferencesPanel({
  mutedPublications,
  onToggleMute,
  bulkOptOut,
  onToggleBulkOptOut,
}: {
  mutedPublications: Set<string>;
  onToggleMute: (id: string) => void;
  bulkOptOut: boolean;
  onToggleBulkOptOut: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t">
      <button
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Email Preferences
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t px-4 pt-3 pb-4">
              {/* Bulk opt-out */}
              <div className="mb-4">
                <button
                  onClick={onToggleBulkOptOut}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2.5 text-xs transition-colors"
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      bulkOptOut
                        ? 'bg-destructive border-destructive'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {bulkOptOut && <Check className="h-3 w-3 text-white" />}
                  </div>
                  Do not send me bulk email messages
                </button>
              </div>

              {/* Subscription list */}
              <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
                Subscriptions
              </p>
              <div className="space-y-1">
                {PUBLICATIONS.map((pub) => {
                  const isMuted = mutedPublications.has(pub.id);
                  return (
                    <button
                      key={pub.id}
                      onClick={() => onToggleMute(pub.id)}
                      className="hover:bg-muted/50 flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-foreground truncate text-xs font-medium">
                          {pub.name}
                        </span>
                        {pub.campus && (
                          <span className="text-muted-foreground flex shrink-0 items-center gap-0.5 text-[9px]">
                            <MapPin className="h-2.5 w-2.5" />
                            {pub.campus}
                          </span>
                        )}
                      </div>
                      <div
                        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                          !isMuted ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      >
                        <motion.div
                          animate={{ x: !isMuted ? 16 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { accessLevel } = useTestingContext();
  const { buildUrl } = usePreserveParams();
  const { openEmailSheet } = useContactActions();
  const isAuthLoading = status === 'loading';
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MessagesTab>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mutedPublications, setMutedPublications] = useState<Set<string>>(new Set());
  const [bulkOptOut, setBulkOptOut] = useState(false);

  const isStaff = accessLevel === 'medium' || accessLevel === 'high';

  const pageActions = useMemo(() => {
    const actions: PageActionDef[] = [
      {
        key: 'search',
        icon: Search,
        label: 'Search messages',
        variant: 'secondary' as const,
        onAction: () => setSearchOpen((prev) => !prev),
      },
    ];
    if (isStaff) {
      actions.push({
        key: 'compose',
        icon: PenSquare,
        label: 'Compose message',
        variant: 'primary' as const,
        onAction: () => router.push(buildUrl('/messages/compose')),
      });
    }
    return actions;
  }, [isStaff, router, buildUrl]);
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Messages | The Hub';
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle incoming contact from URL params
  useEffect(() => {
    if (loading) return;
    const contactName = searchParams.get('name');
    const contactEmail = searchParams.get('email');
    const action = searchParams.get('action');
    if (contactName && contactEmail && action === 'compose') {
      openEmailSheet({ name: contactName, email: contactEmail });
    }
  }, [loading, searchParams, openEmailSheet]);

  // Build tabs based on access
  const tabs: { id: MessagesTab; label: string; icon: typeof Inbox }[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
  ];
  if (isStaff) {
    tabs.push({ id: 'sent', label: 'Sent', icon: Send });
  }

  const unreadCount = INBOX_MESSAGES.filter(
    (m) => m.unread && !(m.publicationId && mutedPublications.has(m.publicationId))
  ).length;

  // Filter inbox
  const filteredInbox = searchQuery
    ? INBOX_MESSAGES.filter(
        (m) =>
          m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : INBOX_MESSAGES;

  // Filter sent
  const filteredSent = searchQuery
    ? SENT_MESSAGES.filter(
        (m) =>
          m.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.subject && m.subject.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : SENT_MESSAGES;

  const handleToggleMute = (publicationId: string) => {
    setMutedPublications((prev) => {
      const next = new Set(prev);
      if (next.has(publicationId)) {
        next.delete(publicationId);
      } else {
        next.add(publicationId);
      }
      return next;
    });
  };

  // Apps for staff
  const apps = accessLevel === 'high' ? MESSAGES_APPS : [];

  if (isAuthLoading || loading) {
    return (
      <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
        <section className="relative flex flex-col items-center">
          <div className="mb-8 md:mb-16">
            <Mail className="text-muted-foreground/20 mx-auto mb-4 h-16 w-16" />
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Messages</h1>
          </div>
          <LogoSpinner logo={<ChurchLogo className="text-foreground" />} />
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header bar */}
      <div className="bg-background sticky top-0 z-10 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-xl font-bold tracking-tight">Messages</h1>
            <DesktopActionBar />
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden border-t"
            >
              <div className="px-4 py-2">
                <div className="bg-muted flex items-center gap-2 rounded-lg px-3 py-2">
                  <Search className="text-muted-foreground h-4 w-4 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs - only show if staff (since non-staff just has inbox) */}
        {tabs.length > 1 && (
          <div className="flex gap-0 px-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;
              const count = tab.id === 'inbox' ? unreadCount : 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                  }}
                  className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium tracking-wide uppercase transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold ${
                        isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="messages-tab-indicator"
                      className="bg-primary absolute inset-x-0 -bottom-px h-0.5 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Inbox tab */}
      {activeTab === 'inbox' && (
        <>
          <div className="bg-card divide-y">
            {filteredInbox.length > 0 ? (
              filteredInbox.map((message) => (
                <InboxRow
                  key={message.id}
                  message={message}
                  isMuted={
                    message.publicationId ? mutedPublications.has(message.publicationId) : false
                  }
                  onToggleMute={() => {
                    if (message.publicationId) handleToggleMute(message.publicationId);
                  }}
                  onClick={() => router.push(buildUrl(`/messages/${message.id}`))}
                />
              ))
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <Inbox className="text-muted-foreground/30 mb-3 h-12 w-12" />
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? 'No messages match your search' : 'Your inbox is empty'}
                </p>
              </div>
            )}
          </div>

          {/* Email Preferences panel at bottom of inbox */}
          <EmailPreferencesPanel
            mutedPublications={mutedPublications}
            onToggleMute={handleToggleMute}
            bulkOptOut={bulkOptOut}
            onToggleBulkOptOut={() => setBulkOptOut(!bulkOptOut)}
          />
        </>
      )}

      {/* Sent tab */}
      {activeTab === 'sent' && isStaff && (
        <>
          <div className="bg-card divide-y">
            {filteredSent.length > 0 ? (
              filteredSent.map((message) => (
                <SentRow
                  key={message.id}
                  message={message}
                  onClick={() => router.push(buildUrl(`/messages/sent/${message.id}`))}
                />
              ))
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <Send className="text-muted-foreground/30 mb-3 h-12 w-12" />
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? 'No sent messages match your search' : 'No messages sent yet'}
                </p>
              </div>
            )}
          </div>

          {/* Apps section under Sent for staff */}
          {apps.length > 0 && (
            <div className="mt-6 flex flex-col gap-6 pb-6">
              <section className="flex min-w-0 flex-col">
                <SectionTitle icon={Rocket} title="Apps" subtitle="Messaging tools" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {apps.map((app) => (
                    <AppCard
                      key={app.id}
                      name={app.name}
                      description={app.description}
                      icon={app.icon}
                      onClick={() => router.push(buildUrl(app.route))}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
