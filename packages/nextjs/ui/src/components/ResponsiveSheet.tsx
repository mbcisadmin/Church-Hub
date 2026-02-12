'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  Children,
  isValidElement,
  type ReactNode,
} from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';
import { BottomSheet } from '../bottom-sheet';
import { SheetPage, type SheetPageProps } from './SheetNavigator';

// Re-export SheetPage for convenience
export { SheetPage, type SheetPageProps };

// ============================================================================
// Types
// ============================================================================

type SheetMode = 'modal' | 'sheet';

interface ResponsiveSheetContextValue {
  /** Current display mode - 'modal' on desktop, 'sheet' on mobile */
  mode: SheetMode;
  /** The user's resolved theme ('light' or 'dark') */
  resolvedTheme: string | undefined;
  /** Navigate to a specific page */
  navigate: (page: string) => void;
  /** Go back to the previous page */
  goBack: () => void;
  /** Current page name */
  currentPage: string;
  /** Whether back navigation is available */
  canGoBack: boolean;
}

interface ResponsiveSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when the sheet should close */
  onClose: () => void;
  /** Child SheetPage components */
  children: ReactNode;
  /**
   * Header content rendered in the drag area (sheet mode) or top of modal.
   * Can be a ReactNode or a function that receives context for conditional rendering.
   * In sheet mode, this is the area users can drag to close the sheet.
   */
  header?: ReactNode | ((context: ResponsiveSheetContextValue) => ReactNode);
  /** Initial page to display (default: 'main') */
  defaultPage?: string;
  /** Maximum width for modal mode (default: 'max-w-lg') */
  maxWidth?: string;
  /** Breakpoint for switching to modal mode in pixels (default: 768) */
  modalBreakpoint?: number;
  /** Additional class names for the content container */
  className?: string;
  /** Additional class names for the panel (modal or sheet) */
  panelClassName?: string;
  /** Remove default padding from modal panel - useful for edge-to-edge headers */
  noPanelPadding?: boolean;
  /** Maximum height for the bottom sheet on mobile (default: '90dvh') */
  sheetMaxHeight?: string;
}

// ============================================================================
// Context
// ============================================================================

const ResponsiveSheetContext = createContext<ResponsiveSheetContextValue | null>(null);

/**
 * Hook to access ResponsiveSheet context.
 * Provides mode, theme, and navigation utilities.
 */
export function useResponsiveSheet() {
  const context = useContext(ResponsiveSheetContext);
  if (!context) {
    throw new Error('useResponsiveSheet must be used within a ResponsiveSheet');
  }
  return context;
}

// ============================================================================
// Animation Variants
// ============================================================================

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.25,
};

// ============================================================================
// Internal Components
// ============================================================================

interface SheetContentProps {
  pages: { name: string; title?: string; content: ReactNode }[];
  currentPage: string;
  canGoBack: boolean;
  onBack: () => void;
  mode: SheetMode;
  /** Whether a header is being rendered (used for padding in modal mode) */
  hasHeader?: boolean;
}

function SheetContent({
  pages,
  currentPage,
  canGoBack,
  onBack,
  hasHeader = false,
}: SheetContentProps) {
  const activePage = pages.find((p) => p.name === currentPage);
  const direction = currentPage === 'main' ? -1 : 1;

  // Use theme-aware classes for back navigation
  const backButtonClass = 'text-muted-foreground hover:text-foreground';
  const separatorClass = 'text-border';
  const titleClass = 'text-foreground';

  // Add top padding when there's no header (for modal mode spacing)
  const topPadding = !hasHeader ? 'pt-2' : '';

  return (
    <div className={`relative overflow-hidden ${topPadding}`}>
      {/* Back header - shown when not on main page */}
      <AnimatePresence>
        {canGoBack && activePage?.title && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-4 mb-4 flex items-center gap-2 px-6"
          >
            <button
              onClick={onBack}
              className={`-ml-2 flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors ${backButtonClass} hover:bg-muted`}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <span className={separatorClass}>|</span>
            <span className={`text-sm font-semibold tracking-wide uppercase ${titleClass}`}>
              {activePage.title}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content with slide animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentPage}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={pageTransition}
        >
          {activePage?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ResponsiveSheet Component
// ============================================================================

/**
 * A responsive sheet component that displays as a bottom sheet on mobile
 * and a centered modal on desktop.
 *
 * Features:
 * - Automatic viewport detection (mobile = sheet, desktop = modal)
 * - Multi-page navigation with smooth slide transitions
 * - Theme-aware styling based on user preference
 * - Optional header that doubles as drag area on mobile
 * - Shared API for both display modes
 *
 * @example
 * ```tsx
 * <ResponsiveSheet
 *   open={isOpen}
 *   onClose={handleClose}
 *   header={(ctx) => ctx.currentPage === 'main' ? <ContactHeader /> : null}
 * >
 *   <SheetPage name="main" title="Contact">
 *     <ContactDetails />
 *   </SheetPage>
 *   <SheetPage name="email" title="Email">
 *     <EmailOptions />
 *   </SheetPage>
 * </ResponsiveSheet>
 * ```
 */
export function ResponsiveSheet({
  open,
  onClose,
  children,
  header,
  defaultPage = 'main',
  maxWidth = 'max-w-3xl',
  modalBreakpoint = 768,
  className = '',
  panelClassName = '',
  noPanelPadding = false,
  sheetMaxHeight,
}: ResponsiveSheetProps) {
  const { resolvedTheme } = useTheme();
  const [mode, setMode] = useState<SheetMode>('sheet');
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [history, setHistory] = useState<string[]>([defaultPage]);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detect viewport mode
  useEffect(() => {
    const checkMode = () => {
      setMode(window.innerWidth >= modalBreakpoint ? 'modal' : 'sheet');
    };

    checkMode();
    window.addEventListener('resize', checkMode);
    return () => window.removeEventListener('resize', checkMode);
  }, [modalBreakpoint]);

  // Reset navigation when sheet opens or closes
  useEffect(() => {
    if (open) {
      // When opening, sync to the current defaultPage
      setCurrentPage(defaultPage);
      setHistory([defaultPage]);
    } else {
      // When closing, also reset (for cleanup)
      setCurrentPage(defaultPage);
      setHistory([defaultPage]);
    }
  }, [open, defaultPage]);

  // Navigation functions
  const navigate = useCallback((page: string) => {
    setHistory((prev) => [...prev, page]);
    setCurrentPage(page);
  }, []);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentPage(newHistory[newHistory.length - 1]);
    }
  }, [history]);

  const canGoBack = history.length > 1;

  // Check if content is scrollable and update indicator
  const checkScrollIndicator = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const hasMoreContent = container.scrollHeight > container.clientHeight + 5;
    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 20;

    setShowScrollIndicator(hasMoreContent && !isAtBottom);
  }, []);

  // Set up scroll indicator tracking for modal mode
  useEffect(() => {
    if (mode !== 'modal' || !open) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Check initially
    checkScrollIndicator();

    // Check after delays to account for content rendering and animations
    const timeouts = [
      setTimeout(checkScrollIndicator, 50),
      setTimeout(checkScrollIndicator, 150),
      setTimeout(checkScrollIndicator, 300),
    ];

    // Listen for scroll events
    container.addEventListener('scroll', checkScrollIndicator);
    window.addEventListener('resize', checkScrollIndicator);

    // Use ResizeObserver to detect content size changes
    const resizeObserver = new ResizeObserver(checkScrollIndicator);
    resizeObserver.observe(container);
    // Also observe the first child if it exists
    if (container.firstElementChild) {
      resizeObserver.observe(container.firstElementChild);
    }

    return () => {
      timeouts.forEach(clearTimeout);
      container.removeEventListener('scroll', checkScrollIndicator);
      window.removeEventListener('resize', checkScrollIndicator);
      resizeObserver.disconnect();
    };
  }, [mode, open, currentPage, checkScrollIndicator]);

  // Extract SheetPage children
  const pages: { name: string; title?: string; content: ReactNode }[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === SheetPage) {
      const { name, title, children: pageChildren } = child.props as SheetPageProps;
      pages.push({ name, title, content: pageChildren });
    }
  });

  // Context value
  const contextValue: ResponsiveSheetContextValue = {
    mode,
    resolvedTheme,
    navigate,
    goBack,
    currentPage,
    canGoBack,
  };

  // Resolve header content (can be ReactNode or function)
  const resolvedHeader = typeof header === 'function' ? header(contextValue) : header;

  // Sheet mode (mobile)
  if (mode === 'sheet') {
    return (
      <ResponsiveSheetContext.Provider value={contextValue}>
        <BottomSheet
          open={open}
          onClose={onClose}
          className={panelClassName || 'bg-[#0b0d0c]'}
          header={resolvedHeader}
          hideHandle={noPanelPadding && !!resolvedHeader}
          maxHeight={sheetMaxHeight}
          lightScrollIndicator={panelClassName?.includes('bg-card')}
        >
          <SheetContent
            pages={pages}
            currentPage={currentPage}
            canGoBack={canGoBack}
            onBack={goBack}
            mode={mode}
            hasHeader={!!resolvedHeader}
          />
        </BottomSheet>
      </ResponsiveSheetContext.Provider>
    );
  }

  // Default panel styling (dark theme to match bottom sheet)
  const defaultPanelClass = 'bg-[#0b0d0c]';
  const panelClass = panelClassName || defaultPanelClass;

  // Modal mode (desktop)
  return (
    <ResponsiveSheetContext.Provider value={contextValue}>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop - very subtle since sheet appears immediately */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/20"
              onClick={onClose}
            />

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`relative z-10 mx-4 flex max-h-[90vh] w-full flex-col overflow-hidden shadow-2xl ${noPanelPadding ? '' : 'p-4'} ${maxWidth} ${panelClass} ${className}`}
            >
              {/* Close button - positioned absolutely over content */}
              <button
                onClick={onClose}
                className={`absolute z-20 p-1 text-white/50 transition-colors hover:text-white ${noPanelPadding ? 'top-4 right-4' : 'top-2 right-2'}`}
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header (rendered in modal) */}
              {resolvedHeader && (
                <div className={`shrink-0 ${noPanelPadding ? '' : 'pt-2'}`}>{resolvedHeader}</div>
              )}

              {/* Content - scrollable area */}
              <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto">
                <SheetContent
                  hasHeader={!!resolvedHeader}
                  pages={pages}
                  currentPage={currentPage}
                  canGoBack={canGoBack}
                  onBack={goBack}
                  mode={mode}
                />
              </div>

              {/* Scroll indicator - shows when more content below */}
              <AnimatePresence>
                {showScrollIndicator && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`pointer-events-none absolute right-0 bottom-0 left-0 flex h-20 items-end justify-center ${
                      panelClassName?.includes('bg-card')
                        ? 'bg-gradient-to-t from-[var(--card)] to-transparent'
                        : 'bg-gradient-to-t from-[#0b0d0c] to-transparent'
                    }`}
                  >
                    <div
                      className={`mb-3 flex flex-col items-center gap-1 ${
                        panelClassName?.includes('bg-card')
                          ? 'text-muted-foreground'
                          : 'text-white/50'
                      }`}
                    >
                      <span className="text-xs font-medium tracking-wide uppercase">
                        Scroll for more
                      </span>
                      <motion.div
                        animate={{ y: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ChevronLeft className="h-4 w-4 -rotate-90" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ResponsiveSheetContext.Provider>
  );
}

// Re-export types for consumers (SheetPageProps is re-exported at top from SheetNavigator)
export type { ResponsiveSheetProps, ResponsiveSheetContextValue, SheetMode };
