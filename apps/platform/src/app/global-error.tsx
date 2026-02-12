'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  // global-error must render its own html/body since the root layout may have failed
  return (
    <html lang="en">
      <body className="bg-white text-zinc-900">
        <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertOctagon className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-wider uppercase">Something Went Wrong</h1>
          <p className="mb-2 text-sm tracking-widest text-zinc-500 uppercase">
            We hit an unexpected error
          </p>
          <p className="mb-8 max-w-md text-sm text-zinc-600">
            Something broke on our end. Try refreshing the page, and if that doesn't work, give it a
            few minutes and try again.
          </p>

          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-zinc-900 px-6 py-3 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-zinc-800"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          {error.digest && <p className="mt-6 text-xs text-zinc-400">Error ID: {error.digest}</p>}
        </div>
      </body>
    </html>
  );
}
