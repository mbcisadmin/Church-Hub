import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">403</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Access Denied</h2>
        <p className="mt-2 text-gray-600">You don&apos;t have permission to access this page.</p>
        <div className="mt-6">
          <Link
            href="/"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
