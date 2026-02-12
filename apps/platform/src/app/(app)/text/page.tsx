'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  MessageSquare,
  Search,
  Plus,
  X,
  Building2,
  Rocket,
  Users,
  Send,
  MessageCircle,
  Smartphone,
  ExternalLink,
  UserSearch,
  Pin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle } from '@church/nextjs-ui/components/SectionTitle';
import { AppCard } from '@church/nextjs-ui/components/AppCard';
import { useRegisterPageActions, DesktopActionBar } from '@church/nextjs-ui/page-actions';
import { ResponsiveSheet, SheetPage } from '@church/nextjs-ui/components/ResponsiveSheet';
import LogoSpinner from '@church/nextjs-ui/components/LogoSpinner';
import ChurchLogo from '@/components/ChurchLogo';
import { useTestingContext } from '@/components/TestingParamsProvider';
import { usePreserveParams } from '@/lib/usePreserveParams';
import { useContactActions } from '@/components/ContactActionProvider';

// Mock conversations from church number
const CONVERSATIONS = [
  {
    id: '1',
    contactName: 'John Smith',
    phone: '(574) 555-1234',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    lastMessage: 'Thanks for the info about Sunday!',
    time: '3:42 PM',
    date: 'Today',
    unread: true,
    unreadCount: 2,
  },
  {
    id: '2',
    contactName: 'Amy Rodriguez',
    phone: '(574) 555-2345',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    lastMessage: "I'll be there for the meeting.",
    time: '1:15 PM',
    date: 'Today',
    unread: true,
    unreadCount: 1,
  },
  {
    id: '3',
    contactName: 'Sarah Johnson',
    phone: '(574) 555-0101',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMessage: 'You: Sounds good, see you then!',
    time: '11:00 AM',
    date: 'Today',
    unread: false,
    unreadCount: 0,
  },
  {
    id: '4',
    contactName: 'Tom Baker',
    phone: '(574) 555-3456',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    lastMessage: 'Can you send me the volunteer schedule?',
    time: '9:30 AM',
    date: 'Today',
    unread: false,
    unreadCount: 0,
  },
  {
    id: '5',
    contactName: 'Lisa Kim',
    phone: '(574) 555-4567',
    avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
    lastMessage: 'Got it, thanks!',
    time: 'Yesterday',
    date: 'Yesterday',
    unread: false,
    unreadCount: 0,
  },
  {
    id: '6',
    contactName: 'Mark Davis',
    phone: '(574) 555-5678',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    lastMessage: "We're confirmed for Wednesday.",
    time: 'Yesterday',
    date: 'Yesterday',
    unread: false,
    unreadCount: 0,
  },
  {
    id: '7',
    contactName: 'Emily Williams',
    phone: '(574) 555-0303',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    lastMessage: 'You: The curriculum materials are in the office',
    time: 'Feb 6',
    date: 'Feb 6',
    unread: false,
    unreadCount: 0,
  },
];

// Pinned conversations (iOS-style)
const PINNED_THREADS = [
  {
    id: 'p1',
    name: 'Amy Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    type: 'person' as const,
    unread: true,
  },
  {
    id: 'p2',
    name: 'Youth Leaders',
    avatar: null,
    type: 'group' as const,
    unread: false,
  },
  {
    id: 'p3',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    type: 'person' as const,
    unread: false,
  },
  {
    id: 'p4',
    name: 'Worship Team',
    avatar: null,
    type: 'group' as const,
    unread: true,
  },
];

// Apps
const TEXT_APPS = [
  {
    id: 'mass-text',
    name: 'Mass Text',
    description: 'Send individual texts to a group of people at once',
    icon: Users,
    route: '/text/mass-text',
  },
  {
    id: 'broadcast',
    name: 'Broadcast',
    description: 'Send mass text notifications to lists',
    icon: Send,
    route: '/text/broadcast',
  },
  {
    id: 'auto-replies',
    name: 'Auto Replies',
    description: 'Set up automatic text responses',
    icon: MessageCircle,
    route: '/text/auto-replies',
  },
];

// ============================================================================
// Mock contact search results (would come from API)
// ============================================================================

const CONTACT_SUGGESTIONS = [
  { id: 'c1', name: 'John Smith', phone: '(574) 555-1234' },
  { id: 'c2', name: 'Amy Rodriguez', phone: '(574) 555-2345' },
  { id: 'c3', name: 'Sarah Johnson', phone: '(574) 555-0101' },
  { id: 'c4', name: 'Tom Baker', phone: '(574) 555-3456' },
  { id: 'c5', name: 'Lisa Kim', phone: '(574) 555-4567' },
  { id: 'c6', name: 'Mark Davis', phone: '(574) 555-5678' },
  { id: 'c7', name: 'Emily Williams', phone: '(574) 555-0303' },
  { id: 'c8', name: 'Rachel Green', phone: '(574) 555-7890' },
  { id: 'c9', name: 'David Chen', phone: '(574) 555-8901' },
  { id: 'c10', name: 'Maria Santos', phone: '(574) 555-9012' },
];

type Recipient = { id: string; name: string; phone: string };

// ============================================================================
// New Message Sheet Header
// ============================================================================

const MESSAGE_GRADIENT = 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)';

function NewMessageSheetHeader({ recipientCount }: { recipientCount: number }) {
  return (
    <div
      className="relative overflow-hidden px-4 pt-3 pb-4 md:px-8 md:pt-6 md:pb-6"
      style={{ background: MESSAGE_GRADIENT }}
    >
      {/* Mobile drag handle */}
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>

      {/* Watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <Send className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      <div className="relative z-10">
        <p className="mb-1 text-xs font-bold tracking-wider text-white/70 uppercase">Compose</p>
        <h2 className="text-xl font-bold tracking-wider text-white uppercase md:text-2xl">
          New Message
        </h2>
        {recipientCount > 0 && (
          <p className="mt-1 text-sm text-white/70">
            {recipientCount} {recipientCount === 1 ? 'recipient' : 'recipients'}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// New Message Sheet Content
// ============================================================================

function NewMessageSheetContent({
  onClose,
  recipients,
  setRecipients,
}: {
  onClose: () => void;
  recipients: Recipient[];
  setRecipients: React.Dispatch<React.SetStateAction<Recipient[]>>;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [sendMethod, setSendMethod] = useState<'platform' | 'personal'>('platform');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = searchQuery.trim()
    ? CONTACT_SUGGESTIONS.filter(
        (c) =>
          !recipients.some((r) => r.id === c.id) &&
          (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery))
      )
    : [];

  const addRecipient = useCallback((contact: Recipient) => {
    setRecipients((prev) => [...prev, contact]);
    setSearchQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  const removeRecipient = useCallback((id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleSend = () => {
    if (sendMethod === 'personal' && recipients.length === 1) {
      const phone = recipients[0].phone.replace(/[^0-9+]/g, '');
      window.open(`sms:${phone}${message ? `&body=${encodeURIComponent(message)}` : ''}`, '_self');
    } else {
      // Send from platform (church number) - supports multiple recipients
      // TODO: API call to send via church number
      onClose();
    }
  };

  return (
    <div className="bg-card p-4 md:p-6">
      {/* To field - multi-recipient */}
      <div className="mb-4">
        <label className="text-muted-foreground mb-1.5 flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
          To
          <span className="text-muted-foreground/60 text-[10px] font-normal tracking-normal normal-case">
            Add multiple people to send individual texts to each
          </span>
        </label>
        <div className="bg-muted relative rounded-lg">
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
            {/* Recipient chips */}
            {recipients.map((r) => (
              <span
                key={r.id}
                className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5 text-xs font-medium"
              >
                {r.name}
                <button
                  onClick={() => removeRecipient(r.id)}
                  className="hover:bg-primary/20 flex h-4 w-4 items-center justify-center rounded-full transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}

            {/* Search input */}
            <div className="flex min-w-[140px] flex-1 items-center gap-2">
              <UserSearch className="text-muted-foreground h-4 w-4 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSuggestions(true);
                }}
                placeholder={
                  recipients.length > 0
                    ? 'Add more people...'
                    : 'Search contacts or enter a number...'
                }
                className="text-foreground placeholder:text-muted-foreground w-full bg-transparent py-0.5 text-sm outline-none"
              />
            </div>
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="border-border absolute right-0 left-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-[#0b0d0c] shadow-lg"
              >
                {filteredSuggestions.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => addRecipient(contact)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/70">
                      {contact.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{contact.name}</p>
                      <p className="text-xs text-white/50">{contact.phone}</p>
                    </div>
                    <Plus className="h-4 w-4 shrink-0 text-white/30" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {recipients.length > 1 && (
          <p className="text-muted-foreground mt-1.5 text-[11px]">
            Each person will receive their own individual text - not a group chat.
          </p>
        )}
      </div>

      {/* Send method toggle */}
      <div className="mb-4">
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wider uppercase">
          Send from
        </label>
        <div className="bg-muted flex gap-1 rounded-lg p-1">
          <button
            onClick={() => setSendMethod('platform')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              sendMethod === 'platform'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Church Number
          </button>
          <button
            onClick={() => setSendMethod('personal')}
            disabled={recipients.length > 1}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              sendMethod === 'personal'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            } ${recipients.length > 1 ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            My Phone
          </button>
        </div>
        <p className="text-muted-foreground mt-1.5 text-[11px]">
          {sendMethod === 'platform'
            ? 'Message will be sent from the church number. Replies will appear in this app.'
            : recipients.length > 1
              ? 'Personal phone can only send to one person at a time.'
              : 'This will open your phone\u2019s messaging app to send from your personal number.'}
        </p>
      </div>

      {/* Message body */}
      <div className="mb-4">
        <label className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wider uppercase">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          rows={4}
          className="bg-muted text-foreground placeholder:text-muted-foreground w-full resize-none rounded-lg px-3 py-2.5 text-sm outline-none"
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={recipients.length === 0}
        className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-sm transition-all hover:shadow-md disabled:shadow-none"
      >
        {sendMethod === 'personal' && recipients.length <= 1 ? (
          <>
            <ExternalLink className="h-4 w-4" />
            Open in Messaging App
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {recipients.length > 1
              ? `Send to ${recipients.length} People`
              : 'Send from Church Number'}
          </>
        )}
      </button>
    </div>
  );
}

// ============================================================================
// New Message Sheet (ResponsiveSheet wrapper)
// ============================================================================

function NewMessageSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  // Reset recipients when sheet closes
  useEffect(() => {
    if (!open) setRecipients([]);
  }, [open]);

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      panelClassName="bg-card overflow-hidden"
      maxWidth="max-w-lg"
      noPanelPadding
      header={<NewMessageSheetHeader recipientCount={recipients.length} />}
    >
      <SheetPage name="main">
        <NewMessageSheetContent
          onClose={onClose}
          recipients={recipients}
          setRecipients={setRecipients}
        />
      </SheetPage>
    </ResponsiveSheet>
  );
}

// ============================================================================
// Conversation Row
// ============================================================================

function ConversationRow({
  conversation,
  onClick,
}: {
  conversation: (typeof CONVERSATIONS)[0];
  onClick: () => void;
}) {
  const initials = conversation.contactName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('');

  return (
    <button
      onClick={onClick}
      className={`hover:bg-muted/50 group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
        conversation.unread ? 'bg-primary/[0.03]' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {conversation.avatar ? (
          <img
            src={conversation.avatar}
            alt={conversation.contactName}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold">
            {initials}
          </div>
        )}
        {/* Church number indicator */}
        <div className="bg-primary absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
          <Building2 className="h-2.5 w-2.5 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm ${conversation.unread ? 'text-foreground font-bold' : 'text-foreground font-medium'}`}
          >
            {conversation.contactName}
          </span>
          <span
            className={`shrink-0 text-xs ${conversation.unread ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
          >
            {conversation.time}
          </span>
        </div>
        <p
          className={`mt-0.5 truncate text-sm ${conversation.unread ? 'text-foreground/80 font-medium' : 'text-muted-foreground'}`}
        >
          {conversation.lastMessage}
        </p>
      </div>

      {/* Unread badge */}
      {conversation.unreadCount > 0 && (
        <span className="bg-primary text-primary-foreground flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
          {conversation.unreadCount}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function TextPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { accessLevel } = useTestingContext();
  const { buildUrl } = usePreserveParams();
  const { openPhoneSheet } = useContactActions();
  const isAuthLoading = status === 'loading';
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  const isStaff = accessLevel === 'medium' || accessLevel === 'high';

  const pageActions = useMemo(
    () => [
      {
        key: 'search',
        icon: Search,
        label: 'Search conversations',
        variant: 'secondary' as const,
        onAction: () => setSearchOpen((prev) => !prev),
      },
      {
        key: 'new-message',
        icon: Plus,
        label: 'New message',
        variant: 'primary' as const,
        onAction: () => setNewMessageOpen(true),
      },
    ],
    []
  );
  useRegisterPageActions(pageActions);

  useEffect(() => {
    document.title = 'Text | The Hub';
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle incoming contact from URL params
  useEffect(() => {
    if (loading) return;
    const contactName = searchParams.get('name');
    const contactPhone = searchParams.get('phone');
    const action = searchParams.get('action');
    if (contactName && contactPhone && action === 'text') {
      openPhoneSheet({ name: contactName, phone: contactPhone });
    }
  }, [loading, searchParams, openPhoneSheet]);

  // Filter conversations
  const filteredConversations = searchQuery
    ? CONVERSATIONS.filter(
        (c) =>
          c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery)
      )
    : CONVERSATIONS;

  const unreadCount = CONVERSATIONS.filter((c) => c.unread).length;

  // Filter apps based on access level
  const apps = accessLevel === 'high' ? TEXT_APPS : TEXT_APPS.slice(0, 1);

  if (isAuthLoading || loading) {
    return (
      <div className="flex flex-col items-center px-6 pt-16 text-center md:pt-24">
        <section className="relative flex flex-col items-center">
          <div className="mb-8 md:mb-16">
            <MessageSquare className="text-muted-foreground/20 mx-auto mb-4 h-16 w-16" />
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Text</h1>
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
            <h1 className="text-foreground text-xl font-bold tracking-tight">Text</h1>
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
                    placeholder="Search conversations..."
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
      </div>

      {/* Pinned threads - iOS style */}
      {PINNED_THREADS.length > 0 && !searchQuery && (
        <div className="border-b px-4 py-3">
          <div className="scrollbar-none flex gap-4 overflow-x-auto">
            {PINNED_THREADS.map((thread) => {
              const initials = thread.name
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('');
              const isGroup = thread.type === 'group';

              return (
                <button
                  key={thread.id}
                  onClick={() => router.push(buildUrl(`/text/conversations/${thread.id}`))}
                  className="flex w-14 shrink-0 flex-col items-center gap-1"
                >
                  <div className="relative">
                    {thread.avatar ? (
                      <img
                        src={thread.avatar}
                        alt={thread.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${
                          isGroup ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isGroup ? <Users className="h-5 w-5" /> : initials}
                      </div>
                    )}
                    {thread.unread && (
                      <div className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500 dark:border-gray-900" />
                    )}
                    <div className="bg-primary absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                      <Pin className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <span className="text-foreground w-full truncate text-center text-[10px] leading-tight font-medium">
                    {thread.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversations list */}
      <div className="bg-card divide-y">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              onClick={() => router.push(buildUrl(`/text/conversations/${conversation.id}`))}
            />
          ))
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <MessageSquare className="text-muted-foreground/30 mb-3 h-12 w-12" />
            <p className="text-muted-foreground text-sm">
              {searchQuery ? 'No conversations match your search' : 'No messages yet'}
            </p>
          </div>
        )}
      </div>

      {/* Apps section */}
      {apps.length > 0 && (
        <div className="mt-6 flex flex-col gap-6 pb-6">
          <section className="flex min-w-0 flex-col">
            <SectionTitle icon={Rocket} title="Apps" subtitle="Texting tools" />
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

      {/* New Message Sheet */}
      <NewMessageSheet open={newMessageOpen} onClose={() => setNewMessageOpen(false)} />
    </div>
  );
}
