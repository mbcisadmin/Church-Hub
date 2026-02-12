'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, ChevronRight, Clock } from 'lucide-react';
import { ResponsiveSheet, SheetPage } from '@church/nextjs-ui/components/ResponsiveSheet';
import { ActionCard } from '@church/nextjs-ui/components/ActionCard';
import { Icon } from '@/lib/icons';
import type {
  GlobalSearchResponse,
  GlobalSearchResult,
  AppNameMatch,
  AppContentResults,
} from '@/types/globalSearch';

interface SearchHistoryItem {
  id: number;
  type: string;
  resultId: string;
  title: string;
  subtitle?: string;
  route: string;
  icon?: string;
  imageUrl?: string;
  clickedAt: string;
}

const BRAND_GREEN_GRADIENT = 'var(--brand-gradient)';

interface SearchSheetProps {
  open: boolean;
  onClose: () => void;
}

// Header component with green gradient and watermark
function SearchHeader() {
  return (
    <div
      className="relative overflow-hidden px-4 pt-4 pb-6 md:px-6 md:pt-6 md:pb-8"
      style={{ background: BRAND_GREEN_GRADIENT }}
    >
      {/* Mobile drag handle */}
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1.5 w-14 rounded-full bg-white/30" />
      </div>

      {/* Search icon watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <Search className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      {/* Title */}
      <div className="relative z-10">
        <h2 className="text-xl font-bold tracking-wide text-white md:text-2xl">Search</h2>
        <p className="mt-1 text-sm text-white/70">Find people, apps, and dashboards</p>
      </div>
    </div>
  );
}

export default function SearchSheet({ open, onClose }: SearchSheetProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResponse | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Auto-focus input and fetch history when sheet opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);

      // Fetch search history
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const response = await fetch('/api/search/history');
          if (response.ok) {
            const data = await response.json();
            setHistory(data.history || []);
          }
        } catch (error) {
          console.error('Failed to fetch search history:', error);
        } finally {
          setIsLoadingHistory(false);
        }
      };

      fetchHistory();

      return () => clearTimeout(timer);
    }
  }, [open]);

  // Blur active element (dismiss keyboard on mobile)
  const dismissKeyboard = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  // Handle Enter key to dismiss keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
      dismissKeyboard();
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults(null);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/global-search?q=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const data: GlobalSearchResponse = await response.json();
          setResults(data);
          dismissKeyboard();
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, dismissKeyboard]);

  // Reset when closing
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults(null);
    }
  }, [open]);

  // Track a search result click (fire-and-forget)
  const trackClick = useCallback(
    (params: {
      resultType: string;
      resultId: string;
      resultTitle: string;
      resultSubtitle?: string;
      resultRoute: string;
      resultIcon?: string;
      resultImageUrl?: string;
    }) => {
      console.log('[SearchSheet] Tracking click:', params);
      fetch('/api/search/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
        .then((res) => {
          console.log('[SearchSheet] Track response:', res.status);
          return res.json();
        })
        .then((data) => console.log('[SearchSheet] Track data:', data))
        .catch((err) => console.error('Failed to track search click:', err));
    },
    []
  );

  const handleResultClick = useCallback(
    (route: string) => {
      router.push(route);
      onClose();
    },
    [router, onClose]
  );

  // Handle app/dashboard click with tracking
  const handleAppClick = useCallback(
    (item: AppNameMatch) => {
      trackClick({
        resultType: item.type,
        resultId: item.key,
        resultTitle: item.name,
        resultSubtitle: item.description || undefined,
        resultRoute: item.route,
        resultIcon: item.icon,
      });
      handleResultClick(item.route);
    },
    [trackClick, handleResultClick]
  );

  // Handle content result click with tracking
  const handleContentClick = useCallback(
    (result: GlobalSearchResult) => {
      trackClick({
        resultType: result.app_key,
        resultId: String(result.result_id),
        resultTitle: result.title,
        resultSubtitle: result.subtitle || undefined,
        resultRoute: result.route,
        resultImageUrl: result.image_url || undefined,
      });
      handleResultClick(result.route);
    },
    [trackClick, handleResultClick]
  );

  // Handle history item click
  const handleHistoryClick = useCallback(
    (item: SearchHistoryItem) => {
      trackClick({
        resultType: item.type,
        resultId: item.resultId,
        resultTitle: item.title,
        resultSubtitle: item.subtitle,
        resultRoute: item.route,
        resultIcon: item.icon,
        resultImageUrl: item.imageUrl,
      });
      handleResultClick(item.route);
    },
    [trackClick, handleResultClick]
  );

  const hasResults =
    results &&
    (results.apps.length > 0 ||
      results.dashboards.length > 0 ||
      results.content_results.length > 0);

  // Subtle hover styles for modal context (no scale, just subtle bg)
  const subtleHoverClasses = 'hover:scale-100 hover:shadow-sm hover:bg-accent/50';

  // Render a single content result item
  const renderResultItem = (result: GlobalSearchResult) => (
    <ActionCard
      key={`${result.app_key}-${result.result_id}`}
      onClick={() => handleContentClick(result)}
      className={subtleHoverClasses}
    >
      {result.image_url ? (
        <img
          src={result.image_url}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="text-primary flex shrink-0 items-center justify-center">
          <Icon name="Users" className="h-8 w-8" />
        </div>
      )}
      <div className="min-w-0 flex-1 text-left">
        <p className="text-foreground truncate font-semibold">{result.title}</p>
        {result.subtitle && (
          <p className="text-muted-foreground mt-0.5 truncate text-sm">{result.subtitle}</p>
        )}
        {result.metadata && (
          <p className="text-muted-foreground truncate text-sm">{result.metadata}</p>
        )}
      </div>
      <ChevronRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
    </ActionCard>
  );

  // Render app/dashboard name matches
  const renderNameMatchSection = (items: AppNameMatch[], title: string) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
          {title}
        </div>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ActionCard
              key={item.key}
              onClick={() => handleAppClick(item)}
              className={subtleHoverClasses}
            >
              <div className="text-primary flex shrink-0 items-center justify-center">
                <Icon name={item.icon} className="h-8 w-8" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-foreground font-semibold">{item.name}</p>
                {item.description && (
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                    {item.description}
                  </p>
                )}
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            </ActionCard>
          ))}
        </div>
      </div>
    );
  };

  // Render content results grouped by app
  const renderContentSection = (appResults: AppContentResults) => {
    if (appResults.results.length === 0) return null;

    return (
      <div key={appResults.app_key} className="mb-6">
        <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
          <Icon name={appResults.app_icon} className="h-4 w-4" />
          <span>{appResults.app_name}</span>
        </div>
        <div className="flex flex-col gap-3">
          {appResults.results.map(renderResultItem)}
          {appResults.has_more && (
            <button
              type="button"
              onClick={() =>
                handleResultClick(`${appResults.app_key}?search=${encodeURIComponent(query)}`)
              }
              className="text-primary hover:text-primary/80 py-2 text-left text-sm transition-colors"
            >
              See more results...
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      panelClassName="bg-card overflow-hidden"
      maxWidth="max-w-3xl"
      noPanelPadding
      header={<SearchHeader />}
    >
      <SheetPage name="main">
        <div className="min-h-[50vh] px-4 py-6 md:px-6">
          {/* Search input */}
          <div className="relative mb-6">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search people, apps..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              enterKeyHint="search"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary h-12 w-full border pr-12 pl-12 text-base focus:ring-2 focus:outline-none"
            />
            {isLoading && (
              <Loader2 className="text-muted-foreground absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 animate-spin" />
            )}
          </div>

          {/* Loading state */}
          {isLoading && !results && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          )}

          {/* No query yet - show history or empty state */}
          {!query.trim() && !isLoading && (
            <>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : history.length > 0 ? (
                <div className="mb-6">
                  <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                    <Clock className="h-4 w-4" />
                    <span>Recent</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {history.map((item) => (
                      <ActionCard
                        key={item.id}
                        onClick={() => handleHistoryClick(item)}
                        className={subtleHoverClasses}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="text-primary flex shrink-0 items-center justify-center">
                            <Icon name={item.icon || 'Search'} className="h-8 w-8" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-foreground truncate font-semibold">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-muted-foreground mt-0.5 truncate text-sm">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                      </ActionCard>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground py-12 text-center">
                  <Search className="mx-auto mb-3 h-12 w-12 opacity-30" />
                  <p className="text-sm">Start typing to search</p>
                </div>
              )}
            </>
          )}

          {/* No results */}
          {!isLoading && query.trim() && !hasResults && (
            <div className="text-muted-foreground py-12 text-center">
              <p className="text-sm">No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {/* Results */}
          {hasResults && results && (
            <>
              {renderNameMatchSection(results.apps, 'Apps')}
              {renderNameMatchSection(results.dashboards, 'Dashboards')}
              {results.content_results.map(renderContentSection)}
            </>
          )}
        </div>
      </SheetPage>
    </ResponsiveSheet>
  );
}
