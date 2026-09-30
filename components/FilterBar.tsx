"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Genre, POPULAR_COUNTRIES } from "@/lib/tmdb";

interface Props {
  genres: Genre[];
  activeGenre?: string;
  activeYear?: string;
  activeType?: string;
  activeCountry?: string;
  activeSort?: string;
  showTypeFilter?: boolean;
  showCountryFilter?: boolean;
  showSortFilter?: boolean;
  basePath: string;
}

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

export default function FilterBar({
  genres,
  activeGenre,
  activeYear,
  activeType,
  activeCountry,
  activeSort,
  showTypeFilter = false,
  showCountryFilter = true,
  showSortFilter = true,
  basePath,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${basePath}?${params.toString()}`);
      });
    },
    [router, searchParams, basePath]
  );

  return (
    <div
      className="flex flex-wrap gap-3 items-center p-4 sm:p-5 rounded-2xl mb-8 bg-[#0a0c12]/90 border border-white/[0.08] backdrop-blur-xl shadow-lg"
      role="group"
      aria-label="Filter catalog"
    >
      <div className="flex items-center gap-2 mr-2 text-zinc-400">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Filter:</span>
      </div>

      {showTypeFilter && (
        <div className="relative">
          <label htmlFor="filter-type" className="sr-only">Content type</label>
          <select
            id="filter-type"
            value={activeType ?? ""}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="text-xs font-semibold rounded-xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] hover:border-red-500/40 text-zinc-200 outline-none cursor-pointer transition-colors"
            disabled={isPending}
          >
            <option value="" className="bg-[#0e1018]">All Types</option>
            <option value="movie" className="bg-[#0e1018]">Movies</option>
            <option value="tv" className="bg-[#0e1018]">TV Series</option>
          </select>
        </div>
      )}

      <div className="relative">
        <label htmlFor="filter-genre" className="sr-only">Genre</label>
        <select
          id="filter-genre"
          value={activeGenre ?? ""}
          onChange={(e) => updateFilter("genre", e.target.value)}
          className="text-xs font-semibold rounded-xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] hover:border-red-500/40 text-zinc-200 outline-none cursor-pointer transition-colors"
          disabled={isPending}
        >
          <option value="" className="bg-[#0e1018]">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={String(g.id)} className="bg-[#0e1018]">
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <label htmlFor="filter-year" className="sr-only">Release year</label>
        <select
          id="filter-year"
          value={activeYear ?? ""}
          onChange={(e) => updateFilter("year", e.target.value)}
          className="text-xs font-semibold rounded-xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] hover:border-red-500/40 text-zinc-200 outline-none cursor-pointer transition-colors"
          disabled={isPending}
        >
          <option value="" className="bg-[#0e1018]">All Years</option>
          {YEARS.map((y) => (
            <option key={y} value={y} className="bg-[#0e1018]">
              {y}
            </option>
          ))}
        </select>
      </div>

      {showCountryFilter && (
        <div className="relative">
          <label htmlFor="filter-country" className="sr-only">Country</label>
          <select
            id="filter-country"
            value={activeCountry ?? ""}
            onChange={(e) => updateFilter("country", e.target.value)}
            className="text-xs font-semibold rounded-xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] hover:border-red-500/40 text-zinc-200 outline-none cursor-pointer transition-colors"
            disabled={isPending}
          >
            <option value="" className="bg-[#0e1018]">All Countries</option>
            {POPULAR_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#0e1018]">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showSortFilter && (
        <div className="relative">
          <label htmlFor="filter-sort" className="sr-only">Sort by</label>
          <select
            id="filter-sort"
            value={activeSort || "latest"}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="text-xs font-semibold rounded-xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] hover:border-red-500/40 text-zinc-200 outline-none cursor-pointer transition-colors"
            disabled={isPending}
          >
            <option value="latest" className="bg-[#0e1018]">Latest Release</option>
            <option value="popular" className="bg-[#0e1018]">Most Popular</option>
            <option value="top_rated" className="bg-[#0e1018]">Top Rated</option>
          </select>
        </div>
      )}

      {(activeGenre || activeYear || activeType || activeCountry || (activeSort && activeSort !== "latest")) && (
        <button
          onClick={() => {
            startTransition(() => router.push(basePath));
          }}
          className="text-xs font-semibold px-3.5 py-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
          disabled={isPending}
        >
          Reset Filter
        </button>
      )}

      {isPending && (
        <div
          className="w-4 h-4 border-2 border-transparent border-t-red-600 rounded-full animate-spin ml-auto"
          aria-label="Loading..."
          role="status"
        />
      )}
    </div>
  );
}
