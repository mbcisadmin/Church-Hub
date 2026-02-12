/**
 * Global Search Types
 *
 * Defines the contract for cross-app search functionality.
 */

/**
 * A single search result from any app
 */
export type GlobalSearchResult = {
  /** Unique identifier for this result */
  result_id: string | number;
  /** Main display text */
  title: string;
  /** Secondary text (email, location, etc) */
  subtitle?: string;
  /** Additional context (age, status, etc) */
  metadata?: string;
  /** Avatar/icon URL */
  image_url?: string;
  /** Route to navigate when clicked */
  route: string;
  /** Which app owns this result */
  app_key: string;
};

/**
 * Type of application
 */
export type AppType = 'app' | 'dashboard';

/**
 * An app that matched by name in the search
 */
export type AppNameMatch = {
  key: string;
  name: string;
  description?: string | null;
  icon: string;
  route: string;
  type: AppType;
};

/**
 * Content results grouped by app
 */
export type AppContentResults = {
  app_key: string;
  app_name: string;
  app_icon: string;
  results: GlobalSearchResult[];
  has_more: boolean;
};

/**
 * The full response from the global search orchestrator
 */
export type GlobalSearchResponse = {
  /** Apps matching by name */
  apps: AppNameMatch[];
  /** Dashboards matching by name */
  dashboards: AppNameMatch[];
  /** Content results grouped by app */
  content_results: AppContentResults[];
};

/**
 * App configuration for search
 */
export type SearchableApp = {
  key: string;
  name: string;
  description?: string | null;
  icon: string;
  route: string;
  type: AppType;
  searchable: boolean;
  search_endpoint: string | null;
};
