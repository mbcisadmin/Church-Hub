'use client';

import { Pin, Plus, Trash2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { ResponsiveSheet, SheetPage } from '@church/nextjs-ui/components/ResponsiveSheet';

const BRAND_GREEN_GRADIENT = 'var(--brand-gradient)';

export type PinnedItem = {
  id: string;
  label: string;
  route: string;
};

interface PinSheetHeaderProps {
  category: string;
  itemCount: number;
}

function PinSheetHeader({ category, itemCount }: PinSheetHeaderProps) {
  return (
    <div
      className="relative overflow-hidden px-4 pt-4 pb-6 md:px-8 md:pt-6 md:pb-8"
      style={{ background: BRAND_GREEN_GRADIENT }}
    >
      {/* Mobile drag handle */}
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>

      {/* Pin icon watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <Pin className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      <div className="relative z-10">
        <p className="text-xs font-bold tracking-wider text-white/70 uppercase">
          Pinned {category}
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-white md:text-2xl">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </h2>
      </div>
    </div>
  );
}

interface PinnedItemRowProps {
  item: PinnedItem;
  onNavigate: (route: string) => void;
  onRemove: (id: string) => void;
}

function PinnedItemRow({ item, onNavigate, onRemove }: PinnedItemRowProps) {
  return (
    <div className="border-border/50 flex items-center justify-between border-b p-4 last:border-b-0">
      <button
        onClick={() => onNavigate(item.route)}
        className="text-foreground hover:text-primary flex-1 text-left text-sm font-medium transition-colors"
      >
        {item.label}
      </button>
      <button
        onClick={() => onRemove(item.id)}
        className="text-muted-foreground hover:text-destructive ml-3 p-2 transition-colors"
        aria-label={`Remove ${item.label} from pins`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

interface PinSheetProps {
  open: boolean;
  onClose: () => void;
  /** Category name for display (e.g., "Events", "Dashboards") */
  category: string;
  /** Current page title for "Pin this page" option */
  currentPageTitle: string;
  /** List of pinned items for this category */
  pinnedItems: PinnedItem[];
  /** Whether the current page is already pinned */
  isCurrentPagePinned: boolean;
  /** Called when user wants to pin the current page */
  onPinCurrentPage: () => void;
  /** Called when user removes a pinned item */
  onRemovePin: (id: string) => void;
}

export default function PinSheet({
  open,
  onClose,
  category,
  currentPageTitle,
  pinnedItems,
  isCurrentPagePinned,
  onPinCurrentPage,
  onRemovePin,
}: PinSheetProps) {
  const router = useRouter();

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route);
  };

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      panelClassName="bg-card overflow-hidden"
      maxWidth="max-w-md"
      noPanelPadding
      header={<PinSheetHeader category={category} itemCount={pinnedItems.length} />}
    >
      <SheetPage name="main">
        <div className="bg-card">
          {/* Pin current page option */}
          {!isCurrentPagePinned && (
            <button
              onClick={() => {
                onPinCurrentPage();
                onClose();
              }}
              className="border-border/50 hover:bg-muted/50 flex w-full items-center gap-3 border-b p-4 text-left transition-colors"
            >
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                <Plus className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">Pin this page</p>
                <p className="text-muted-foreground text-xs">{currentPageTitle}</p>
              </div>
            </button>
          )}

          {/* Pinned items list */}
          {pinnedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Pin className="text-muted-foreground/30 h-12 w-12" />
              <p className="text-muted-foreground mt-4 text-sm font-medium">No pinned items</p>
              <p className="text-muted-foreground/70 mt-1 text-xs">
                Pin your favorite {category.toLowerCase()} for quick access
              </p>
            </div>
          ) : (
            <div>
              {pinnedItems.map((item) => (
                <PinnedItemRow
                  key={item.id}
                  item={item}
                  onNavigate={handleNavigate}
                  onRemove={onRemovePin}
                />
              ))}
            </div>
          )}
        </div>
      </SheetPage>
    </ResponsiveSheet>
  );
}
