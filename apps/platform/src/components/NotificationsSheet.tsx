'use client';

import { Bell, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  ResponsiveSheet,
  SheetPage,
  useResponsiveSheet,
} from '@church/nextjs-ui/components/ResponsiveSheet';

const BRAND_GREEN_GRADIENT = 'var(--brand-gradient)';

export type Notification = {
  id: string;
  title: string;
  description?: string;
  category: string;
  timestamp: Date;
  read: boolean;
  url?: string;
};

// Mock data - will be replaced with API call
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New message in your group',
    description: 'John shared a prayer request',
    category: 'Small Groups',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    url: '/apps/groups/123',
  },
  {
    id: '2',
    title: 'Event reminder',
    description: 'Circles training tomorrow at 9am',
    category: 'Events',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: false,
  },
  {
    id: '3',
    title: 'Budget approved',
    description: 'Q1 2026 budget has been approved',
    category: 'Finance',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
  },
];

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

interface NotificationsHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

function NotificationsHeader({ unreadCount, onMarkAllRead }: NotificationsHeaderProps) {
  const { mode } = useResponsiveSheet();

  return (
    <div
      className="relative overflow-hidden px-4 pt-4 pb-6 md:px-8 md:pt-6 md:pb-8"
      style={{ background: BRAND_GREEN_GRADIENT }}
    >
      {/* Mobile drag handle */}
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>

      {/* Bell icon watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <Bell className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider text-white/70 uppercase">
              Notifications
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-white md:text-2xl">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </h2>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/30"
            >
              <Check className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  return (
    <button
      onClick={onClick}
      className="hover:bg-muted/50 border-border/50 flex w-full items-start gap-3 border-b p-4 text-left transition-colors last:border-b-0"
    >
      {/* Unread indicator */}
      <div className="mt-1.5 flex h-2.5 w-2.5 flex-shrink-0 items-center justify-center">
        {!notification.read && <div className="bg-primary h-2.5 w-2.5 rounded-full" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${notification.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}
        >
          {notification.title}
        </p>
        {notification.description && (
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
            {notification.description}
          </p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">
          {notification.category} · {formatTimestamp(notification.timestamp)}
        </p>
      </div>
    </button>
  );
}

interface NotificationsSheetProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export default function NotificationsSheet({
  open,
  onClose,
  notifications,
  onMarkAllRead,
  onNotificationClick,
}: NotificationsSheetProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      panelClassName="bg-card overflow-hidden"
      maxWidth="max-w-lg"
      noPanelPadding
      header={<NotificationsHeader unreadCount={unreadCount} onMarkAllRead={onMarkAllRead} />}
    >
      <SheetPage name="main">
        <div className="bg-card">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="text-muted-foreground/30 h-12 w-12" />
              <p className="text-muted-foreground mt-4 text-sm font-medium">No notifications</p>
              <p className="text-muted-foreground/70 mt-1 text-xs">You're all caught up!</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => onNotificationClick(notification)}
                />
              ))}
            </div>
          )}
        </div>
      </SheetPage>
    </ResponsiveSheet>
  );
}

// Export mock data for use in AppHeader
export { MOCK_NOTIFICATIONS };
