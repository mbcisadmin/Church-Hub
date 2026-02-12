export default function CurrentTabSkeleton() {
  return (
    <div>
      {/* Mobile: single skeleton chart card */}
      <div className="mb-6 md:hidden">
        <div className="bg-muted h-64 w-full animate-pulse rounded" />
      </div>

      {/* Desktop: Row 1 - 2 skeleton chart cards */}
      <div className="mb-6 hidden grid-cols-2 gap-6 md:grid">
        <div className="bg-muted h-64 w-full animate-pulse rounded" />
        <div className="bg-muted h-64 w-full animate-pulse rounded" />
      </div>

      {/* Desktop: Row 2 - 2 skeleton chart cards */}
      <div className="hidden grid-cols-2 gap-6 md:grid">
        <div className="bg-muted h-64 w-full animate-pulse rounded" />
        <div className="bg-muted h-64 w-full animate-pulse rounded" />
      </div>
    </div>
  );
}
