"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Genre } from "@/lib/tmdb";

interface Props {
  genres: Genre[];
  activeGenre?: string;
  activeYear?: string;
  activeType?: string;
  showTypeFilter?: boolean;
  basePath: string;
}

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

export default function FilterBar({
  genres,
  activeGenre,
  activeYear,
  activeType,
  showTypeFilter = false,
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
      aria-label="Filter katalog"
    >
      <div className="flex items-center gap-2 mr-2 text-zinc-400">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Filter:</span>
      </div>

      {showTypeFilter && (
        <div className="relative">
          <label htmlFor="filter-type" className="sr-only">Tipe konten</label>
          <select
            id="filter-type"
            value={activeType ?? ""}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="text-xs font-semibold rounded-xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] hover:border-amber-400/40 text-zinc-200 outline-none cursor-pointer transition-colors"
            disabled={isPending}
          >
            <option value="" className="bg-[#0e1018]">Semua Tipe</option>
            <option value="movie" className="bg-[#0e1018]">Film Bioskop</option>
            <option value="tv" className="bg-[#0e1018]">Serial TV</option>
          </select>
        </div>
      )}

      <div className="relative">
        <label htmlFor="filter-genre" className="sr-only">Genre</label>
        <select
          id="filter-genre"
          value={activeGenre ?? ""}
          onChange={(e) => updateFilter("genre", e.target.value)}
          className="text-xs font-semibold rounded-xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] hover:border-amber-400/40 text-zinc-200 outline-none cursor-pointer transition-colors"
          disabled={isPending}
        >
          <option value="" className="bg-[#0e1018]">Semua Genre</option>
          {genres.map((g) => (
            <option key={g.id} value={String(g.id)} className="bg-[#0e1018]">
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <label htmlFor="filter-year" className="sr-only">Tahun rilis</label>
        <select
          id="filter-year"
          value={activeYear ?? ""}
          onChange={(e) => updateFilter("year", e.target.value)}
          className="text-xs font-semibold rounded-xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.1] hover:border-amber-400/40 text-zinc-200 outline-none cursor-pointer transition-colors"
          disabled={isPending}
        >
          <option value="" className="bg-[#0e1018]">Semua Tahun</option>
          {YEARS.map((y) => (
            <option key={y} value={y} className="bg-[#0e1018]">
              {y}
            </option>
          ))}
        </select>
      </div>

      {(activeGenre || activeYear || activeType) && (
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
          className="w-4 h-4 border-2 border-transparent border-t-amber-400 rounded-full animate-spin ml-auto"
          aria-label="Memuat..."
          role="status"
        />
      )}
    </div>
  );
}
