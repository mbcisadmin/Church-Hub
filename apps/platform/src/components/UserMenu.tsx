'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, LogOut, UserSearch } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ImpersonateModal from '@/components/ImpersonateModal';

interface UserMenuProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin?: boolean;
  onSignOut: () => void;
  children: React.ReactNode;
}

export default function UserMenu({
  firstName,
  lastName,
  email,
  isAdmin,
  onSignOut,
  children,
}: UserMenuProps) {
  const { theme, setTheme } = useTheme();
  const [impersonateModalOpen, setImpersonateModalOpen] = useState(false);

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'User';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="hover:border-primary cursor-pointer rounded-full border-2 border-transparent bg-transparent p-0 transition-colors outline-none"
          >
            {children}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 rounded-none border-black/[0.04] p-0 shadow-xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.07]"
          style={{
            background: theme === 'dark' ? 'rgba(30, 30, 30, 0.3)' : 'rgba(255, 255, 255, 0.38)',
          }}
        >
          {/* Name / Email header */}
          <DropdownMenuLabel className="border-b border-black/[0.06] px-4 pt-3 pb-2.5 font-normal dark:border-white/10">
            <p className="text-[15px] leading-snug font-semibold">{displayName}</p>
            {email && <p className="text-muted-foreground mt-0.5 text-xs">{email}</p>}
          </DropdownMenuLabel>

          {/* Actions */}
          <div className="px-1.5 py-1.5">
            <DropdownMenuItem
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="focus:bg-primary/15 focus:text-foreground cursor-pointer gap-3 rounded-md px-2.5 py-2 dark:focus:bg-white/10"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </DropdownMenuItem>

            {/* Admin-only options */}
            {isAdmin && (
              <>
                <DropdownMenuSeparator className="my-1 bg-black/[0.06] dark:bg-white/10" />
                <DropdownMenuLabel className="text-muted-foreground px-2.5 py-1 text-xs font-semibold uppercase">
                  Admin Tools
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => setImpersonateModalOpen(true)}
                  className="focus:bg-primary/15 focus:text-foreground cursor-pointer gap-3 rounded-md px-2.5 py-2 dark:focus:bg-white/10"
                >
                  <UserSearch className="h-4 w-4" />
                  Impersonate User
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator className="my-1 bg-black/[0.06] dark:bg-white/10" />
            <DropdownMenuItem
              onClick={onSignOut}
              className="focus:text-foreground cursor-pointer gap-3 rounded-md px-2.5 py-2 focus:bg-black/5 dark:focus:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Impersonate Modal */}
      <ImpersonateModal open={impersonateModalOpen} onOpenChange={setImpersonateModalOpen} />
    </>
  );
}
