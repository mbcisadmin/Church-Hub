import type { ComponentType } from 'react';

export interface PageActionDef {
  /** Unique identifier */
  key: string;
  /** Icon component */
  icon: ComponentType<{ className?: string }>;
  /** Accessible label + action sheet text */
  label: string;
  /** Handler when action is triggered */
  onAction: () => void;
  /** Visual variant (default: 'primary') */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Whether action is always present or contextual (default: 'static') */
  lifecycle?: 'static' | 'dynamic';
  /** Toggle visibility without unmounting (default: true) */
  visible?: boolean;
  /** Optional badge count (e.g., active filter count) */
  badge?: number;
  /** If true, this action owns its own mobile trigger (e.g., FilterBar's PeekSheet FAB) */
  selfRendered?: boolean;
}
