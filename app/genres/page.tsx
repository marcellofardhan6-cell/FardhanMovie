import Link from "next/link";
import { POPULAR_GENRES } from "@/lib/tmdb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse by Genre",
  description: "Explore movies and TV series by genre.",
};

const GENRE_ICONS: Record<number, string> = {
  28: "💥",   // Action
  12: "🗺️",   // Adventure
  16: "🎨",   // Animation
  35: "😂",   // Comedy
  80: "🚨",   // Crime
  99: "📹",   // Documentary
  18: "🎭",   // Drama
  10751: "👨‍👩‍👧‍👦", // Family
  14: "🧙‍♂️",  // Fantasy
  36: "📜",   // History
  27: "👻",   // Horror
  10402: "🎵", // Music
  9648: "🔍",  // Mystery
  10749: "❤️", // Romance
  878: "🚀",   // Sci-Fi
  53: "⚡",    // Thriller
  10752: "🪖", // War
  37: "🤠",   // Western
};

export default function GenresPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Page Header */}
      <div className="mb-10 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
            Explore Categories
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Browse by Genre
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
          Pick your favorite vibe — from heart-pounding action to thrilling mysteries and comedies.
        </p>
      </div>

      {/* Genres Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {POPULAR_GENRES.map((genre) => {
          const icon = GENRE_ICONS[genre.id] || "🎬";
          return (
            <Link
              key={genre.id}
              href={`/films?genre=${genre.id}`}
              className="group p-5 rounded-2xl bg-[#0c0e17] border border-white/[0.08] hover:border-red-500/50 hover:bg-[#121522] transition-all duration-300 flex flex-col items-center justify-center text-center shadow-lg hover:-translate-y-1 hover:shadow-red-600/10 cursor-pointer"
            >
              <span className="text-3xl mb-2.5 transform group-hover:scale-125 transition-transform duration-200">
                {icon}
              </span>
              <span className="text-sm font-bold text-zinc-200 group-hover:text-red-400 transition-colors">
                {genre.name}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1 group-hover:text-zinc-400">
                Explore &rarr;
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
