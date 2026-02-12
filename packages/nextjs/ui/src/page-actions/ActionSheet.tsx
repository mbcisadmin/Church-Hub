'use client';

import { cn } from '../lib/utils';
import type { PageActionDef } from './types';

const variantStyles = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-foreground text-background',
  tertiary: 'bg-muted text-muted-foreground',
};

interface ActionSheetProps {
  actions: PageActionDef[];
  onClose: () => void;
}

/**
 * Content for the BottomSheet action list.
 * Each action renders as a row with circular icon + label.
 */
export function ActionSheet({ actions, onClose }: ActionSheetProps) {
  return (
    <div className="flex flex-col px-2 pt-1 pb-4">
      {actions.map((action) => {
        const Icon = action.icon;
        const variant = action.variant ?? 'primary';
        return (
          <button
            key={action.key}
            onClick={() => {
              action.onAction();
              onClose();
            }}
            className="hover:bg-muted/50 active:bg-muted flex items-center gap-4 rounded-2xl px-4 py-3 transition-colors"
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                variantStyles[variant]
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-foreground text-[15px] font-medium">{action.label}</span>
            {action.badge != null && action.badge > 0 && (
              <span className="bg-primary text-primary-foreground ml-auto rounded-full px-2 py-0.5 text-xs font-semibold">
                {action.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
