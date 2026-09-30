"use client";

import Link from "next/link";
import { ANIME_GENRE_LIST } from "@/lib/tmdb";

interface Props {
  activeGenre?: string;
  variant?: "cards" | "pills";
}

export default function AnimeGenreExplorer({ activeGenre = "", variant = "cards" }: Props) {
  const genres = ANIME_GENRE_LIST.filter((g) => g.id !== "");

  if (variant === "pills") {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href="/anime"
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            !activeGenre
              ? "bg-[#FF6400] text-black shadow-md shadow-[#FF6400]/25 font-black"
              : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-[#FF6400]/40"
          }`}
        >
          Semua Genre
        </Link>
        {genres.map((g) => {
          const isActive = activeGenre === g.id;
          return (
            <Link
              key={g.id}
              href={`/anime?genre=${g.id}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-[#FF6400] text-black shadow-md shadow-[#FF6400]/25 font-black"
                  : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-[#FF6400]/40"
              }`}
            >
              <span>{g.icon}</span>
              <span>{g.name}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <section className="rounded-2xl bg-[#0c0e15] border border-white/[0.08] p-5 sm:p-7 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF6400]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FF6400]">
              Kategori Anime
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Jelajahi Berdasarkan Genre
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pilih genre favoritmu — dari shonen penuh aksi hingga isekai dan romansa sekolah
          </p>
        </div>

        {activeGenre && (
          <Link
            href="/anime"
            className="text-xs font-bold text-[#FF6400] hover:underline transition-colors shrink-0"
          >
            Reset Filter &rarr;
          </Link>
        )}
      </div>

      {/* Grid of Anime Genre Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {genres.map((g) => {
          const isActive = activeGenre === g.id;
          return (
            <Link
              key={`genre-${g.id}`}
              href={`/anime?genre=${g.id}`}
              className={`group p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                isActive
                  ? "bg-[#FF6400]/15 border-[#FF6400] shadow-md shadow-[#FF6400]/20"
                  : "bg-[#121520] border-white/[0.06] hover:border-[#FF6400]/50 hover:bg-[#161a29]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl transform group-hover:scale-110 transition-transform">
                    {g.icon}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500 font-mono tracking-wider">
                    {g.jpName}
                  </span>
                </div>
                <h3
                  className={`text-sm font-bold transition-colors ${
                    isActive ? "text-[#FF6400]" : "text-white group-hover:text-[#FF6400]"
                  }`}
                >
                  {g.name}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {g.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500 group-hover:text-[#FF6400] transition-colors font-semibold">
                <span>Eksplorasi</span>
                <span>&rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
