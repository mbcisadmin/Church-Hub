// Lib utils
export * from './lib/utils';

// Shadcn UI Components
export * from './ui/alert-dialog';
export * from './ui/alert';
export * from './ui/avatar';
export * from './ui/breadcrumb';
export * from './ui/button';
export * from './ui/calendar';
export * from './ui/card';
export * from './ui/chart';
export * from './ui/checkbox';
export * from './ui/dialog';
export * from './ui/drawer';
export * from './ui/dropdown-menu';
export * from './ui/form';
export * from './ui/input';
export * from './ui/label';
export * from './ui/number-spinner';
export * from './ui/popover';
export * from './ui/radio-group';
export * from './ui/select';
export * from './ui/skeleton';
export * from './ui/switch';
export * from './ui/textarea';
export * from './ui/tooltip';

// Core Infrastructure
export * from './components/ThemeProvider';
export * from './components/SessionProvider';
export * from './components/Header';
export * from './components/Footer';
export * from './components/Sidebar';
export * from './components/AuthWrapper';

// Admin Tools
export * from './components/AppSimulationModal';
export * from './components/SimulationBanner';
export * from './components/UserMenu/UserMenu';
export * from './components/UserMenu/ImpersonateModal';
export * from './components/UserMenu/actions';

// PWA
export * from './components/DynamicManifest';
export * from './components/PWAInstallPrompt';

// Utilities
export * from './components/SearchableSelect';

// Layout
export * from './components/SectionHeader';
export * from './components/TitleHighlight';

// Interactive Cards
export * from './components/ActionCard';

// Controls
export * from './components/SegmentedControl';

// Loading
export * from './components/LogoSpinner';

// Scroll Indicators
export * from './components/ScrollIndicator';

// Pinned Items
export * from './components/PinnedItems';
export * from './components/PinnedItemCard';

// Category Page Components
export * from './components/HorizontalScroll';
export * from './components/SectionTitle';
export * from './components/AppCard';
export * from './components/PageActions';
export * from './components/QuickActions';

// Data Visualization
export * from './components/Sparkline';

// Entity Cards (consistent height for mixed carousels)
export * from './components/BaseCard';
export * from './components/CardActions';
export * from './components/CardInnerBlock';
export * from './components/EventCard';
export * from './components/DashboardCard';
export * from './components/GroupCard';
export * from './components/PersonCard';

// Mobile
export * from './bottom-sheet';
export * from './swipeable-tabs';
export * from './swipeable-primitives';
export * from './date-swiper';
export * from './swipeable-counter';
export * from './components/SheetNavigator';
// ResponsiveSheet re-exports SheetPage from SheetNavigator, so we need to exclude it here
export {
  ResponsiveSheet,
  useResponsiveSheet,
  type ResponsiveSheetProps,
  type ResponsiveSheetContextValue,
  type SheetMode,
} from './components/ResponsiveSheet';

// Peek Sheet
export * from './peek-sheet';

// Contact Action Sheets
export * from './components/PhoneSheet';
export * from './components/EmailSheet';

// Expandable Components
export * from './components/ExpandableCard';
