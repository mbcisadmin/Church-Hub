'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';

/**
 * Root error boundary for the app.
 * This catches errors outside of the (app) layout.
 * For errors inside (app), see app/(app)/error.tsx
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <section className="relative flex flex-col items-center">
        <SectionHeader
          title="Something Went Wrong"
          subtitle="We hit an unexpected bump"
          icon={AlertTriangle}
          variant="watermark"
          as="h1"
          className="mb-4"
        />
        <p className="text-muted-foreground max-w-md text-sm tracking-wide md:text-base">
          Something broke on our end. Try refreshing the page, and if that doesn't work, give it a
          few minutes and try again.
        </p>

        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide uppercase transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>

        {error.digest && (
          <p className="text-muted-foreground/50 mt-6 text-xs">Error ID: {error.digest}</p>
        )}
      </section>
    </div>
  );
}
