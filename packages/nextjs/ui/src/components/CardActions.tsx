'use client';

import { Trash2, Check, X, Pin, PinOff, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

export interface CardAction {
  /** Unique key for the action */
  key: string;
  /** Icon component to display */
  icon: React.ComponentType<{ className?: string }>;
  /** Accessible label for the action */
  label: string;
  /** Click handler - receives the event, should call stopPropagation */
  onClick: (e: React.MouseEvent) => void;
  /** Color when hovering the action button itself */
  hoverColor?: 'red' | 'green' | 'blue' | 'yellow' | 'gray';
}

// Color mappings for hover states
const hoverColorClasses: Record<string, string> = {
  red: 'hover:text-red-500 hover:bg-red-100',
  green: 'hover:text-green-600 hover:bg-green-100',
  blue: 'hover:text-blue-500 hover:bg-blue-100',
  yellow: 'hover:text-yellow-600 hover:bg-yellow-100',
  gray: 'hover:text-gray-600 hover:bg-gray-200',
};

interface CardActionButtonProps {
  action: CardAction;
  visible: boolean;
}

/**
 * Individual action button rendered on a card.
 * Appears when the card is hovered/focused.
 */
export function CardActionButton({ action, visible }: CardActionButtonProps) {
  const Icon = action.icon;
  const colorClass = hoverColorClasses[action.hoverColor || 'gray'];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        action.onClick(e);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
          e.preventDefault();
          action.onClick(e as unknown as React.MouseEvent);
        }
      }}
      aria-label={action.label}
      className={cn(
        // Base styles
        'flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200',
        // Default state - transparent/invisible
        'bg-transparent text-transparent',
        // When parent card is hovered - show gray
        visible && 'bg-gray-100/80 text-gray-400',
        // Hover on the button itself - show color
        colorClass,
        // Focus styles
        'focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:outline-none'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

interface CardActionsContainerProps {
  actions: CardAction[];
  visible: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Container for card action buttons.
 * Positions the actions and handles visibility.
 */
export function CardActionsContainer({
  actions,
  visible,
  position = 'top-right',
}: CardActionsContainerProps) {
  if (actions.length === 0) return null;

  const positionClasses: Record<string, string> = {
    'top-right': 'top-1 right-1',
    'top-left': 'top-1 left-1',
    'bottom-right': 'bottom-1 right-1',
    'bottom-left': 'bottom-1 left-1',
  };

  return (
    <div
      className={cn(
        'absolute z-20 flex gap-1',
        positionClasses[position],
        // Transition for smooth appearance
        'transition-opacity duration-200',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      {actions.map((action) => (
        <CardActionButton key={action.key} action={action} visible={visible} />
      ))}
    </div>
  );
}

// ============================================================================
// Predefined Actions Factory Functions
// ============================================================================

/**
 * Create an "unpin" action for removing pinned items.
 */
export function createUnpinAction(onUnpin: () => void): CardAction {
  return {
    key: 'unpin',
    icon: Trash2,
    label: 'Remove from pinned',
    onClick: () => onUnpin(),
    hoverColor: 'red',
  };
}

/**
 * Create a "pin" action for adding items to pinned.
 */
export function createPinAction(onPin: () => void): CardAction {
  return {
    key: 'pin',
    icon: Pin,
    label: 'Pin this item',
    onClick: () => onPin(),
    hoverColor: 'blue',
  };
}

/**
 * Create a "complete" action for marking tasks done.
 */
export function createCompleteAction(onComplete: () => void): CardAction {
  return {
    key: 'complete',
    icon: Check,
    label: 'Mark as complete',
    onClick: () => onComplete(),
    hoverColor: 'green',
  };
}

/**
 * Create a "dismiss" action for removing/denying items.
 */
export function createDismissAction(onDismiss: () => void): CardAction {
  return {
    key: 'dismiss',
    icon: X,
    label: 'Dismiss',
    onClick: () => onDismiss(),
    hoverColor: 'red',
  };
}

/**
 * Create a "more options" action for opening a menu.
 */
export function createMoreAction(onMore: () => void): CardAction {
  return {
    key: 'more',
    icon: MoreHorizontal,
    label: 'More options',
    onClick: () => onMore(),
    hoverColor: 'gray',
  };
}
