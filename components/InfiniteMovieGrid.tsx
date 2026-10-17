"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MovieCard from "./MovieCard";
import { Movie } from "@/lib/tmdb";

interface Props {
  initialItems: Movie[];
  totalPages: number;
  catalogParams: Record<string, string | undefined>;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export default function InfiniteMovieGrid({
  initialItems,
  totalPages,
  catalogParams,
  emptyTitle = "No titles found",
  emptySubtitle = "Try adjusting your filters or search keywords.",
}: Props) {
  const [items, setItems] = useState<Movie[]>(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(totalPages > 1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Sync state when props / filters change
  const paramsKey = JSON.stringify(catalogParams);
  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(totalPages > 1);
    setLoading(false);
  }, [paramsKey, initialItems, totalPages]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    if (nextPage > totalPages) {
      setHasMore(false);
      return;
    }

    setLoading(true);
    try {
      const qs = new URLSearchParams();
      Object.entries(catalogParams).forEach(([k, v]) => {
        if (v !== undefined && v !== "") qs.set(k, v);
      });
      qs.set("page", String(nextPage));

      const res = await fetch(`/api/catalog?${qs.toString()}`);
      if (!res.ok) {
        setHasMore(false);
        return;
      }

      const data: { items: Movie[]; totalPages: number } = await res.json();
      if (!data.items || data.items.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => {
          const seen = new Set(prev.map((m) => `${m.media_type || ""}-${m.id}`));
          const newUnique = data.items.filter(
            (m) => !seen.has(`${m.media_type || ""}-${m.id}`)
          );
          return [...prev, ...newUnique];
        });
        setPage(nextPage);
        if (nextPage >= data.totalPages || nextPage >= 500) {
          setHasMore(false);
        }
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, totalPages, catalogParams]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (items.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-[#0c0e17] border border-white/[0.08] text-center px-4">
        <p className="text-lg font-bold text-white mb-2">{emptyTitle}</p>
        <p className="text-xs text-zinc-400">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <section aria-label="Media catalog grid">
      <ul
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
        role="list"
      >
        {items.map((item, i) => (
          <li key={`${item.media_type || "m"}-${item.id}-${i}`}>
            <MovieCard item={item} priority={i < 10} />
          </li>
        ))}
      </ul>

      {/* Sentinel Element for Intersection Observer */}
      <div ref={sentinelRef} className="w-full flex items-center justify-center py-8">
        {loading && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-zinc-300">
              Loading more titles...
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
