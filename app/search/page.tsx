import { searchMulti } from "@/lib/tmdb";
import InfiniteMovieGrid from "@/components/InfiniteMovieGrid";
import type { Metadata } from "next";

export const revalidate = 300;

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return { title: params.q ? `Results for "${params.q}"` : "Search" };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-8">
          Search Movies &amp; TV Series
        </h1>
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-[#0c0e17] border border-white/[0.08] text-center px-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-zinc-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p className="text-base font-bold text-white mb-1">
            Find Your Favorite Titles
          </p>
          <p className="text-xs text-zinc-400 max-w-sm">
            Type a movie, TV show, or anime title in the search box above.
          </p>
        </div>
      </div>
    );
  }

  const data = await searchMulti(query, 1).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 }));
  const items = data.results.filter((item) => item.poster_path && (item.media_type === "movie" || item.media_type === "tv"));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Search results for &ldquo;{query}&rdquo;
        </h1>
        {data.total_results > 0 && (
          <p className="text-xs text-zinc-400 mt-1">
            Found {data.total_results.toLocaleString("en-US")} matching titles.
          </p>
        )}
      </div>

      <InfiniteMovieGrid
        initialItems={items}
        totalPages={data.total_pages || 1}
        catalogParams={{ type: "search", q: query }}
        emptyTitle={`No results found for "${query}"`}
        emptySubtitle="Please check your spelling or try different keywords."
      />
    </div>
  );
}
