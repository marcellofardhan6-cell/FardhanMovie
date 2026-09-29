"use client";

import { useState } from "react";
import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import MovieCard from "@/components/MovieCard";

export default function FavoritesPage() {
  const { favorites, favoritesCount } = useFavorites();
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all");

  const filteredItems = favorites.filter((item) => {
    if (filterType === "all") return true;
    return item.media_type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
              Your Watchlist
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            My Favorites
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {favoritesCount === 0
              ? "You haven't added any favorites yet."
              : `You have ${favoritesCount} saved ${favoritesCount === 1 ? "title" : "titles"} in your watchlist.`}
          </p>
        </div>

        {/* Filter Pills */}
        {favoritesCount > 0 && (
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] self-start sm:self-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === "all"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All ({favorites.length})
            </button>
            <button
              onClick={() => setFilterType("movie")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === "movie"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Movies ({favorites.filter((f) => f.media_type === "movie").length})
            </button>
            <button
              onClick={() => setFilterType("tv")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === "tv"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              TV Series ({favorites.filter((f) => f.media_type === "tv").length})
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {favoritesCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-[#0c0e17] border border-white/[0.08] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No favorites saved yet</h2>
          <p className="text-xs text-zinc-400 max-w-sm mb-6">
            Hover over any movie or series card and tap the heart icon beside play to add it to your personal watchlist.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/films"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/30"
            >
              Browse Movies
            </Link>
            <Link
              href="/series"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.1] transition-all"
            >
              Browse TV Series
            </Link>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-[#0c0e17] border border-white/[0.08] text-center px-4">
          <p className="text-sm font-semibold text-white mb-2">
            No {filterType === "movie" ? "movies" : "TV series"} in your favorites
          </p>
          <button
            onClick={() => setFilterType("all")}
            className="text-xs text-red-400 hover:text-red-300 underline"
          >
            Show all favorites
          </button>
        </div>
      ) : (
        <ul
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
          role="list"
          aria-label="Favorites list"
        >
          {filteredItems.map((item, i) => (
            <li key={`${item.id}-${i}`}>
              <MovieCard item={item as any} priority={i < 5} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
