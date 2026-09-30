"use client";

import Link from "next/link";
import { ANIME_GENRE_LIST } from "@/lib/tmdb";

interface Props {
  activeGenre?: string;
  className?: string;
}

export default function AnimeGenreExplorer({ activeGenre = "", className = "" }: Props) {
  const genres = ANIME_GENRE_LIST.filter((g) => g.id !== "");

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none ${className}`}
      role="navigation"
      aria-label="Anime genre filters"
    >
      <Link
        href="/anime"
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap shrink-0 cursor-pointer ${
          !activeGenre
            ? "bg-[#FF6400] text-black font-bold shadow-md shadow-[#FF6400]/25"
            : "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] hover:border-[#FF6400]/40"
        }`}
      >
        All
      </Link>
      {genres.map((g) => {
        const isActive = activeGenre === g.id;
        return (
          <Link
            key={g.id}
            href={`/anime?genre=${g.id}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              isActive
                ? "bg-[#FF6400] text-black font-bold shadow-md shadow-[#FF6400]/25"
                : "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] hover:border-[#FF6400]/40"
            }`}
          >
            {g.name}
          </Link>
        );
      })}
    </div>
  );
}
