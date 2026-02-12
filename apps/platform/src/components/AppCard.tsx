'use client';

import { ChevronRight } from 'lucide-react';
import { ActionCard } from '@church/nextjs-ui/components/ActionCard';
import { Icon } from '@/lib/icons';

interface AppCardProps {
  name: string;
  description?: string | null;
  route: string;
  icon: string;
}

/**
 * Unified card component for apps and dashboards.
 * Uses ActionCard from UI library for consistent interaction styles.
 */
export function AppCard({ name, description, route, icon }: AppCardProps) {
  return (
    <ActionCard href={route} className="md:p-5">
      {/* Icon */}
      <div className="text-primary flex shrink-0 items-center justify-center">
        <Icon name={icon} className="h-8 w-8 md:h-10 md:w-10" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="text-foreground truncate font-semibold">{name}</h3>
        {description && (
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">{description}</p>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
    </ActionCard>
  );
}
