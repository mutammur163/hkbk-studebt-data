interface LoadingSkeletonProps {
  rows?: number;
  type?: 'table' | 'card' | 'text';
}

export default function LoadingSkeleton({ rows = 5, type = 'table' }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
            <div className="skeleton-shimmer h-4 w-24 rounded mb-4" />
            <div className="skeleton-shimmer h-8 w-32 rounded mb-2" />
            <div className="skeleton-shimmer h-3 w-20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-4 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="p-4 border-b border-surface-border">
        <div className="skeleton-shimmer h-5 w-48 rounded" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50">
          <div className="skeleton-shimmer h-4 w-32 rounded" />
          <div className="skeleton-shimmer h-4 w-24 rounded" />
          <div className="skeleton-shimmer h-4 w-20 rounded" />
          <div className="skeleton-shimmer h-4 w-16 rounded" />
          <div className="skeleton-shimmer h-4 w-28 rounded" />
          <div className="skeleton-shimmer h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
