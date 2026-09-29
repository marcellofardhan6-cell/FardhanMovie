"use client";

import Link from "next/link";
import Image from "next/image";
import { useWatchHistory } from "@/context/WatchHistoryContext";
import { img, backdrop } from "@/lib/tmdb";

export default function ContinueWatching() {
  const { history, removeHistory, isLoaded } = useWatchHistory();

  if (!isLoaded || history.length === 0) return null;

  return (
    <section aria-label="Lanjutkan Menonton" className="relative w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600/15 border border-red-500/25 flex items-center justify-center text-red-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <div>
            <h2
              className="text-lg sm:text-xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Lanjutkan Menonton
            </h2>
            <p className="text-[11px] text-zinc-400">
              Lanjutkan dari bagian terakhir yang kamu buka
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-snap-x scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
        role="list"
        aria-label="Daftar tontonan terakhir"
      >
        {history.map((item) => {
          const isSeries = item.type === "tv";
          const href = isSeries
            ? `/series/${item.id}?season=${item.season || 1}&episode=${item.episode || 1}`
            : `/film/${item.id}`;

          const imageSrc = item.backdrop_path
            ? backdrop(item.backdrop_path)
            : img(item.poster_path ?? null, "w500");

          return (
            <div
              key={`${item.type}-${item.id}`}
              className="relative shrink-0 scroll-snap-item group w-[220px] sm:w-[260px] rounded-xl overflow-hidden bg-[#0e1017] border border-white/[0.08] hover:border-white/20 transition-all shadow-xl"
              role="listitem"
            >
              <Link href={href} className="block relative aspect-video bg-zinc-900 overflow-hidden">
                <Image
                  src={imageSrc}
                  alt={item.title}
                  fill
                  sizes="260px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized={imageSrc.startsWith("/")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/50 scale-90 group-hover:scale-100 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Badge: S1 : E2 or Film */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                    {isSeries ? `S${item.season || 1} : E${item.episode || 1}` : "FILM"}
                  </span>
                  {item.vote_average ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-amber-400 backdrop-blur-sm">
                      ★ {item.vote_average.toFixed(1)}
                    </span>
                  ) : null}
                </div>

                {/* Simulated watch progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-red-600 w-3/4 rounded-r" />
                </div>
              </Link>

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  removeHistory(item.id, item.type);
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10 backdrop-blur-sm border border-white/10"
                title="Hapus dari riwayat"
                aria-label={`Hapus ${item.title} dari riwayat`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Card Title */}
              <div className="p-3">
                <Link href={href} className="block">
                  <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {isSeries ? "Lanjutkan episode" : "Lanjutkan film"} &rarr;
                  </p>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
