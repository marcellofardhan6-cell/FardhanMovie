import { discoverMovies, discoverTV, getMovieGenres, getTVGenres, POPULAR_COUNTRIES } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import FilterBar from "@/components/FilterBar";
import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse by Country",
  description: "Discover top movies and TV series by origin country.",
};

export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ code?: string; type?: string; genre?: string; year?: string; sort?: string; page?: string }>;
}

export default async function CountryPage({ searchParams }: Props) {
  const params = await searchParams;
  const isAll = !params.code || params.code.toUpperCase() === "ALL";
  const activeCode = isAll ? "ALL" : params.code!.toUpperCase();
  const type = params.type || "all";
  const genre = params.genre;
  const year = params.year;
  const sortParam = params.sort || "latest";
  const movieSort =
    sortParam === "popular"
      ? "popularity.desc"
      : sortParam === "top_rated"
      ? "vote_average.desc"
      : "primary_release_date.desc";
  const tvSort =
    sortParam === "popular"
      ? "popularity.desc"
      : sortParam === "top_rated"
      ? "vote_average.desc"
      : "first_air_date.desc";
  const page = Number(params.page ?? 1);

  const selectedCountry = isAll
    ? { code: "ALL", name: "All Countries" }
    : POPULAR_COUNTRIES.find((c) => c.code === activeCode) || {
        code: activeCode,
        name: activeCode,
      };

  const countryParam = isAll ? undefined : activeCode;

  // Fetch data depending on type
  const [movieGenres, tvGenres, moviesData, tvData] = await Promise.all([
    getMovieGenres().catch(() => []),
    getTVGenres().catch(() => []),
    type === "tv"
      ? Promise.resolve({ results: [], total_pages: 0, total_results: 0, page: 1 })
      : discoverMovies({ genre, year, country: countryParam, sort_by: movieSort, page }).catch(() => ({
          results: [],
          total_pages: 0,
          total_results: 0,
          page: 1,
        })),
    type === "movie"
      ? Promise.resolve({ results: [], total_pages: 0, total_results: 0, page: 1 })
      : discoverTV({ genre, year, country: countryParam, sort_by: tvSort, page }).catch(() => ({
          results: [],
          total_pages: 0,
          total_results: 0,
          page: 1,
        })),
  ]);

  // Combine or select results
  let items: any[] = [];
  let totalPages = 1;

  if (type === "movie") {
    items = moviesData.results.map((m) => ({ ...m, media_type: "movie" }));
    totalPages = moviesData.total_pages;
  } else if (type === "tv") {
    items = tvData.results.map((t) => ({ ...t, media_type: "tv" }));
    totalPages = tvData.total_pages;
  } else {
    const mResults = moviesData.results.map((m) => ({ ...m, media_type: "movie" }));
    const tResults = tvData.results.map((t) => ({ ...t, media_type: "tv" }));
    items = [...mResults, ...tResults];
    totalPages = Math.max(moviesData.total_pages, tvData.total_pages);
  }

  // Strictly sort all items chronologically from newest to oldest when 'latest' (the default) is active
  if (sortParam === "latest") {
    items.sort((a, b) => {
      const dateA = new Date(a.release_date || a.first_air_date || "1970-01-01").getTime();
      const dateB = new Date(b.release_date || b.first_air_date || "1970-01-01").getTime();
      return dateB - dateA;
    });
  } else if (sortParam === "top_rated") {
    items.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  } else if (sortParam === "popular") {
    items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  // Deduplicate genres list for filter
  const allGenresMap = new Map();
  [...movieGenres, ...tvGenres].forEach((g) => {
    if (!allGenresMap.has(g.id)) allGenresMap.set(g.id, g);
  });
  const combinedGenres = Array.from(allGenresMap.values());

  // Base query helper
  const buildCountryHref = (code: string) => {
    const q = new URLSearchParams();
    q.set("code", code);
    if (type !== "all") q.set("type", type);
    if (genre) q.set("genre", genre);
    if (year) q.set("year", year);
    if (sortParam && sortParam !== "latest") q.set("sort", sortParam);
    return `/country?${q.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Browse by Country
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          {isAll
            ? "Explore popular films and television shows from all countries worldwide."
            : `Explore films and television shows from ${selectedCountry.name} and across the world.`}
        </p>
      </div>

      {/* Country Pills Horizontal Scroll with 'All Countries' to the left of United States */}
      <div className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scroll-snap-x" style={{ scrollbarWidth: "none" }}>
          {/* All Countries Pill (Left of United States) */}
          <Link
            href={buildCountryHref("ALL")}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCode === "ALL"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30 border border-red-500"
                : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08]"
            }`}
          >
            All Countries
          </Link>

          {/* Individual Countries */}
          {POPULAR_COUNTRIES.map((c) => {
            const isSelected = c.code === activeCode;
            return (
              <Link
                key={c.code}
                href={buildCountryHref(c.code)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30 border border-red-500"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08]"
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Filter Bar with Type, Genre, Year, and Sort */}
      <Suspense>
        <FilterBar
          genres={combinedGenres}
          activeGenre={genre}
          activeYear={year}
          activeType={type === "all" ? "" : type}
          activeCountry={isAll ? "" : activeCode}
          activeSort={sortParam}
          showTypeFilter={true}
          showCountryFilter={false}
          showSortFilter={true}
          basePath="/country"
        />
      </Suspense>

      {/* Results */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-[#0c0e17] border border-white/[0.08]">
          <p className="text-lg font-bold text-white mb-2">
            No titles found for {selectedCountry.name}
          </p>
          <p className="text-xs text-zinc-400">Try selecting another genre or release year.</p>
        </div>
      ) : (
        <MovieGrid items={items} />
      )}

      {/* Luxury Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          {page > 1 && (
            <a
              href={`/country?${new URLSearchParams({
                code: activeCode,
                ...(type !== "all" ? { type } : {}),
                ...(genre ? { genre } : {}),
                ...(year ? { year } : {}),
                ...(sortParam && sortParam !== "latest" ? { sort: sortParam } : {}),
                page: String(page - 1),
              }).toString()}`}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] hover:border-red-500/40 transition-all cursor-pointer"
            >
              &larr; Previous
            </a>
          )}
          <span className="px-4 py-2 text-xs font-medium text-zinc-400 bg-black/40 rounded-full border border-white/[0.05]">
            Page {page} of {Math.min(totalPages, 500)}
          </span>
          {page < totalPages && page < 500 && (
            <a
              href={`/country?${new URLSearchParams({
                code: activeCode,
                ...(type !== "all" ? { type } : {}),
                ...(genre ? { genre } : {}),
                ...(year ? { year } : {}),
                ...(sortParam && sortParam !== "latest" ? { sort: sortParam } : {}),
                page: String(page + 1),
              }).toString()}`}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] hover:border-red-500/40 transition-all cursor-pointer"
            >
              Next &rarr;
            </a>
          )}
        </div>
      )}
    </div>
  );
}
