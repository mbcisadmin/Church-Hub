'use client';

import { Bell } from 'lucide-react';

interface NotificationBellProps {
  count: number;
  onClick: () => void;
}

export default function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex items-center justify-center rounded-md px-1 py-0.5 text-white/70"
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full transition-colors group-hover:bg-white/10">
        <Bell className="group-hover:text-primary h-4 w-4 transition-colors duration-300" />
      </div>
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />
      )}
    </button>
  );
}
