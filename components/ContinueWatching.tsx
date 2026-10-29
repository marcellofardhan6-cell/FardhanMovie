"use client";

import Link from "next/link";
import Image from "next/image";
import { useWatchHistory } from "@/context/WatchHistoryContext";
import { usePreviewModal } from "@/context/PreviewModalContext";
import { img, backdrop, Movie } from "@/lib/tmdb";

function formatMinutes(seconds?: number): string {
  if (!seconds || seconds <= 0) return "0m";
  const mins = Math.floor(seconds / 60);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
}

export default function ContinueWatching() {
  const { history, removeHistory, isLoaded } = useWatchHistory();
  const { openPreview } = usePreviewModal();

  if (!isLoaded || history.length === 0) return null;

  return (
    <section aria-label="Continue Watching" className="relative w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-red-600 rounded-full" aria-hidden="true" />
            <h2
              className="text-lg sm:text-xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Continue Watching
            </h2>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-snap-x scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
        role="list"
        aria-label="Recent watch history"
      >
        {history.map((item) => {
          const isSeries = item.type === "tv";
          const currentSec = item.currentTime || 0;
          const durSec = item.duration || 0;

          const percent = item.progress
            ? Math.min(100, Math.max(4, item.progress))
            : durSec > 0 && currentSec > 0
            ? Math.min(100, Math.max(4, Math.round((currentSec / durSec) * 100)))
            : currentSec > 30
            ? 10
            : 4;

          const startParam = currentSec > 15 ? `&startAt=${Math.floor(currentSec)}` : "";
          const href = isSeries
            ? `/series/${item.id}?season=${item.season || 1}&episode=${item.episode || 1}${startParam}`
            : `/film/${item.id}${currentSec > 15 ? `?startAt=${Math.floor(currentSec)}` : ""}`;

          const imageSrc = item.backdrop_path
            ? backdrop(item.backdrop_path, "w1280")
            : img(item.poster_path ?? null, "w780");

          const timeText =
            currentSec > 0
              ? durSec > 0
                ? `${formatMinutes(currentSec)} / ${formatMinutes(durSec)}`
                : `${Math.floor(currentSec / 60)}m`
              : "Resume";

          const handleCardClick = (e: React.MouseEvent) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            const movieItem: Movie = {
              id: item.id,
              title: item.title,
              name: item.title,
              poster_path: item.poster_path ?? null,
              backdrop_path: item.backdrop_path ?? null,
              media_type: item.type === "tv" ? "tv" : "movie",
              vote_average: item.vote_average ?? 0,
              vote_count: 0,
              overview: "",
              genre_ids: [],
            };
            openPreview(movieItem, false, item.season || 1, item.episode || 1);
          };

          return (
            <div
              key={`${item.type}-${item.id}`}
              className="relative shrink-0 scroll-snap-item group w-[220px] sm:w-[260px] rounded-xl overflow-hidden bg-[#0e1017] border border-white/[0.08] hover:border-white/20 active:scale-[0.97] transition-all duration-300 shadow-xl select-none"
              role="listitem"
            >
              <Link
                href={href}
                onClick={handleCardClick}
                className="block relative aspect-video bg-zinc-900 overflow-hidden cursor-pointer"
              >
                <Image
                  src={imageSrc}
                  alt={item.title}
                  fill
                  sizes="260px"
                  className="object-cover object-[center_top] transition-transform duration-300 group-hover:scale-105"
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

                {/* Badges: Season/Episode & Rating */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    {isSeries && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                        {`S${item.season || 1} · E${item.episode || 1}`}
                      </span>
                    )}
                    {item.vote_average ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-amber-400 backdrop-blur-sm">
                        ★ {item.vote_average.toFixed(1)}
                      </span>
                    ) : null}
                  </div>

                  {currentSec > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-zinc-200 backdrop-blur-sm border border-white/10">
                      {timeText}
                    </span>
                  )}
                </div>

                {/* REAL Watch Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-r transition-all duration-300 shadow-sm shadow-red-600/80"
                    style={{ width: `${percent}%` }}
                  />
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
                title="Remove from history"
                aria-label={`Remove ${item.title} from history`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Card Title & Real Watch Minutes */}
              <div className="p-3">
                <Link href={href} onClick={handleCardClick} className="block cursor-pointer">
                  <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                    <span className="text-zinc-300 font-medium truncate">
                      {currentSec > 0
                        ? durSec > 0
                          ? `${formatMinutes(currentSec)} of ${formatMinutes(durSec)} (${percent}%)`
                          : `${Math.floor(currentSec / 60)}m`
                        : "Resume"}
                    </span>
                    <span className="text-red-400 font-bold shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
                      Resume &rarr;
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
