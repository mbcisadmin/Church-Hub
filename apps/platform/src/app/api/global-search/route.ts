import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@church/nextjs-auth';
import type {
  GlobalSearchResponse,
  GlobalSearchResult,
  AppNameMatch,
  AppContentResults,
  SearchableApp,
} from '@/types/globalSearch';

/**
 * Hardcoded app registry - will be replaced with database lookup later
 */
const APPS: SearchableApp[] = [
  {
    key: 'people-search',
    name: 'People Search',
    description: 'Search and view contact information',
    icon: 'search',
    route: '/people/search',
    type: 'app',
    searchable: true,
    search_endpoint: '/api/people-search/global-search',
  },
  {
    key: 'counter',
    name: 'Counter',
    description: 'Event attendance and metrics tracking',
    icon: 'calculator',
    route: '/apps/counter',
    type: 'app',
    searchable: false,
    search_endpoint: null,
  },
  {
    key: 'circles',
    name: 'Circles',
    description: 'Engagement circles analytics and metrics',
    icon: 'pie-chart',
    route: '/analytics/dashboards/circles',
    type: 'dashboard',
    searchable: false,
    search_endpoint: null,
  },
];

/**
 * Find apps/dashboards that match the query by name (case-insensitive contains)
 */
function findMatchingApps(query: string): { apps: AppNameMatch[]; dashboards: AppNameMatch[] } {
  const lowerQuery = query.toLowerCase();
  const matches = APPS.filter((app) => app.name.toLowerCase().includes(lowerQuery)).map((app) => ({
    key: app.key,
    name: app.name,
    description: app.description,
    icon: app.icon,
    route: app.route,
    type: app.type,
  }));

  return {
    apps: matches.filter((m) => m.type === 'app'),
    dashboards: matches.filter((m) => m.type === 'dashboard'),
  };
}

/**
 * Search an individual app's content endpoint
 */
async function searchAppContent(
  app: SearchableApp,
  query: string,
  baseUrl: string,
  cookies: string
): Promise<AppContentResults | null> {
  if (!app.searchable || !app.search_endpoint) {
    return null;
  }

  try {
    const url = `${baseUrl}${app.search_endpoint}?q=${encodeURIComponent(query)}&limit=4`;

    const response = await fetch(url, {
      headers: {
        Cookie: cookies,
      },
    });

    if (!response.ok) {
      console.error(`Global search: ${app.key} endpoint returned ${response.status}`);
      return null;
    }

    const results: GlobalSearchResult[] = await response.json();

    // Request 4, display 3, set has_more if 4 returned
    const hasMore = results.length === 4;
    const displayResults = hasMore ? results.slice(0, 3) : results;

    return {
      app_key: app.key,
      app_name: app.name,
      app_icon: app.icon,
      results: displayResults,
      has_more: hasMore,
    };
  } catch (error) {
    console.error(`Global search: Failed to search ${app.key}:`, error);
    return null;
  }
}

/**
 * Global Search Orchestrator
 *
 * Searches across all registered apps:
 * 1. Finds apps matching by name
 * 2. Calls each searchable app's endpoint in parallel
 * 3. Aggregates results
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    // Get base URL for internal API calls
    const baseUrl = request.nextUrl.origin;

    // Get cookies to pass auth context to internal endpoints
    const cookies = request.headers.get('cookie') || '';

    // Find apps and dashboards matching by name
    const { apps: matchingApps, dashboards: matchingDashboards } = findMatchingApps(query);

    // Get searchable apps and call their endpoints in parallel
    const searchableApps = APPS.filter((app) => app.searchable && app.search_endpoint);

    const contentResultsPromises = searchableApps.map((app) =>
      searchAppContent(app, query, baseUrl, cookies)
    );

    const contentResultsRaw = await Promise.all(contentResultsPromises);

    // Filter out null results (failed searches)
    const contentResults = contentResultsRaw.filter(
      (result): result is AppContentResults => result !== null
    );

    const response: GlobalSearchResponse = {
      apps: matchingApps,
      dashboards: matchingDashboards,
      content_results: contentResults,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json({ error: 'Failed to perform global search' }, { status: 500 });
  }
}
