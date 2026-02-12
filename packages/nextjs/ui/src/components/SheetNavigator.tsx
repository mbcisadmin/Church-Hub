'use client';

import { createContext, useContext, Children, isValidElement, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

// Context for SheetPage to know if it's active
const SheetNavigatorContext = createContext<{
  currentPage: string;
  navigate: (page: string) => void;
  goBack: () => void;
  canGoBack: boolean;
} | null>(null);

export function useSheetNavigator() {
  const context = useContext(SheetNavigatorContext);
  if (!context) {
    throw new Error('useSheetNavigator must be used within a SheetNavigator');
  }
  return context;
}

interface SheetNavigatorProps {
  /** The currently active page name */
  currentPage: string;
  /** Callback to navigate to a different page */
  onNavigate: (page: string) => void;
  /** Callback when back is pressed (typically navigate to previous page or 'main') */
  onBack: () => void;
  /** Whether back navigation is available */
  canGoBack?: boolean;
  /** Child SheetPage components */
  children: ReactNode;
  /** Additional class names for the container */
  className?: string;
}

interface SheetPageProps {
  /** Unique name/key for this page */
  name: string;
  /** Optional title shown in header when this page is active */
  title?: string;
  /** Content of this page */
  children: ReactNode;
}

/**
 * A page within a SheetNavigator.
 * Only renders when its name matches the current page.
 */
export function SheetPage({ children }: SheetPageProps) {
  // This component is mainly a container for props; rendering is handled by SheetNavigator
  return <>{children}</>;
}

// Animation variants for page transitions
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

/**
 * Navigator component for multi-page bottom sheets.
 * Provides smooth slide transitions between pages with back navigation support.
 *
 * @example
 * ```tsx
 * const [page, setPage] = useState('main');
 * const [history, setHistory] = useState<string[]>(['main']);
 *
 * const navigate = (newPage: string) => {
 *   setHistory(prev => [...prev, newPage]);
 *   setPage(newPage);
 * };
 *
 * const goBack = () => {
 *   if (history.length > 1) {
 *     const newHistory = history.slice(0, -1);
 *     setHistory(newHistory);
 *     setPage(newHistory[newHistory.length - 1]);
 *   }
 * };
 *
 * <SheetNavigator
 *   currentPage={page}
 *   onNavigate={navigate}
 *   onBack={goBack}
 *   canGoBack={history.length > 1}
 * >
 *   <SheetPage name="main" title="Menu">
 *     <button onClick={() => navigate('email')}>Email</button>
 *   </SheetPage>
 *   <SheetPage name="email" title="Email">
 *     <p>user@example.com</p>
 *   </SheetPage>
 * </SheetNavigator>
 * ```
 */
export function SheetNavigator({
  currentPage,
  onNavigate,
  onBack,
  canGoBack = false,
  children,
  className = '',
}: SheetNavigatorProps) {
  // Extract SheetPage children and find the active one
  const pages: { name: string; title?: string; content: ReactNode }[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === SheetPage) {
      const { name, title, children: pageChildren } = child.props as SheetPageProps;
      pages.push({ name, title, content: pageChildren });
    }
  });

  const activePage = pages.find((p) => p.name === currentPage);

  // Track direction for animation (1 = forward, -1 = back)
  // We determine this by comparing to 'main' - going to main is back, anything else is forward
  const direction = currentPage === 'main' ? -1 : 1;

  return (
    <SheetNavigatorContext.Provider
      value={{ currentPage, navigate: onNavigate, goBack: onBack, canGoBack }}
    >
      <div className={`relative overflow-hidden ${className}`}>
        {/* Back header - shown when not on main page */}
        <AnimatePresence>
          {canGoBack && activePage?.title && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-4 flex items-center gap-2 px-6"
            >
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <span className="text-white/30">|</span>
              <span className="text-sm font-semibold tracking-wide text-white uppercase">
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
    </SheetNavigatorContext.Provider>
  );
}

// Re-export types for consumers
export type { SheetNavigatorProps, SheetPageProps };
