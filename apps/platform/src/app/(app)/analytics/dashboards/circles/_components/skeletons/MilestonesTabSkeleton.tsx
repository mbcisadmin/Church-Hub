export default function MilestonesTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton milestone sections — generic pulse blocks */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-muted h-32 w-full animate-pulse rounded" />
      ))}
    </div>
  );
}
