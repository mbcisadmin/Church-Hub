'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, Users, BarChart3, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePreserveParams } from '@/lib/usePreserveParams';

interface Tab {
  id: string;
  label: string;
  icon: typeof Home;
  href: string;
  matchPaths: string[];
}

const TABS: Tab[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/',
    matchPaths: ['/'],
  },
  {
    id: 'events',
    label: 'Events',
    icon: Calendar,
    href: '/events',
    matchPaths: ['/events'],
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    href: '/people/search',
    matchPaths: ['/people'],
  },
  {
    id: 'groups',
    label: 'Groups',
    icon: Users,
    href: '/groups',
    matchPaths: ['/groups'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    matchPaths: ['/analytics'],
  },
];

/**
 * Bottom tab bar for PWA/app mode.
 * Shows 5 main navigation tabs at the bottom of the screen.
 */
export default function PWABottomTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { buildUrl } = usePreserveParams();

  const isActive = (tab: Tab) => {
    if (tab.href === '/' && pathname === '/') return true;
    if (tab.href !== '/') {
      return tab.matchPaths.some((path) => pathname.startsWith(path));
    }
    return false;
  };

  return (
    <nav className="bg-secondary pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-white/10">
      <div className="flex h-16 items-center justify-around">
        {TABS.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => router.push(buildUrl(tab.href))}
              className="relative flex h-full flex-1 flex-col items-center justify-center gap-0.5"
            >
              {active && (
                <motion.div
                  layoutId="pwa-tab-indicator"
                  className="bg-primary absolute top-0 h-0.5 w-8 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`h-5 w-5 transition-colors ${active ? 'text-primary' : 'text-white/50'}`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  active ? 'text-primary' : 'text-white/50'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
