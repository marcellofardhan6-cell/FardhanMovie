export default function MovieCardSkeleton() {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      aria-hidden
    >
      <div className="aspect-[2/3] skeleton" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/3" />
      </div>
    </div>
  );
}
