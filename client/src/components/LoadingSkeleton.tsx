export function CardSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-white border border-gray-100">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl shimmer" />
        <div className="space-y-2">
          <div className="w-20 h-3 rounded shimmer" />
          <div className="w-32 h-6 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-white border border-gray-100">
      <div className="w-40 h-5 rounded shimmer mb-6" />
      <div className="w-full h-64 rounded-xl shimmer" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-white border border-gray-100 space-y-4">
      <div className="w-40 h-5 rounded shimmer" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="w-10 h-10 rounded-lg shimmer" />
          <div className="flex-1 space-y-2">
            <div className="w-3/4 h-3 rounded shimmer" />
            <div className="w-1/2 h-3 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
