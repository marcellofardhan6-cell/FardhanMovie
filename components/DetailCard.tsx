"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/tmdb";
import DownloadModal from "@/components/DownloadModal";

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Props {
  tmdbId?: number | string;
  title?: string;
  posterPath?: string | null;
  rating?: number;
  runtime?: string | null;
  year?: string | null;
  genres?: { id: number; name: string }[];
  overview?: string | null;
  cast?: CastMember[];
  type?: "movie" | "tv";
  isAnime?: boolean;
  watchHref?: string;
  showWatchNow?: boolean;
}

export default function DetailCard({
  tmdbId,
  title = "Untitled",
  posterPath = null,
  rating = 0,
  runtime,
  year,
  genres = [],
  overview,
  cast = [],
  type = "movie",
  isAnime = false,
  watchHref,
  showWatchNow = true,
}: Props) {
  const [showMore, setShowMore] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [posterSrc, setPosterSrc] = useState(img(posterPath, "w500"));

  const displayRating = rating > 0 ? rating.toFixed(1) : null;
  const targetRoute = type === "tv" ? "/series" : "/films";
  const defaultWatchHref = type === "tv" ? `/series/${tmdbId}` : `/film/${tmdbId}`;
  const resolvedWatchHref = watchHref || defaultWatchHref;

  const handleWatchClick = (e: React.MouseEvent) => {
    const playerEl = document.getElementById("player");
    if (playerEl) {
      e.preventDefault();
      playerEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="rounded-2xl bg-[#0d0f16] border border-white/[0.08] p-6 sm:p-8 shadow-2xl text-zinc-200">
      {/* Top Row: Poster on Left, Title & Meta on Right (Matching media_1790663254230.png) */}
      <div className="flex flex-row gap-5 sm:gap-7 items-start">
        {/* Poster Thumbnail */}
        <div className="relative w-24 sm:w-32 md:w-36 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#161922]">
          <Image
            src={posterSrc}
            alt={`Poster ${title}`}
            fill
            className="object-cover"
            priority
            onError={() => setPosterSrc("/poster-placeholder.svg")}
          />
        </div>

        {/* Title, Rating, Meta & Genre Badges */}
        <div className="flex-1 min-w-0 pt-0.5 pr-8 sm:pr-10">
          {/* Film / Series Title + Anime Badge */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
              {title}
            </h1>
            {isAnime && (
              <span className="px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-black tracking-wider bg-[#FF6400] text-black uppercase shadow-md shadow-[#FF6400]/25 shrink-0">
                ANIME
              </span>
            )}
          </div>

          {/* Metadata Row: Rating · Runtime · Year */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-zinc-400 mb-3.5">
            {displayRating && (
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{displayRating}</span>
              </span>
            )}

            {displayRating && (runtime || year) && (
              <span className="text-zinc-600 font-bold">·</span>
            )}

            {runtime && (
              <span className="flex items-center gap-1 text-zinc-300">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{runtime}</span>
              </span>
            )}

            {runtime && year && (
              <span className="text-zinc-600 font-bold">·</span>
            )}

            {year && (
              <span className="flex items-center gap-1 text-zinc-300">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <span>{year}</span>
              </span>
            )}
          </div>

          {/* Genre Pill Badges */}
          {genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {genres.map((g) => {
                const genreHref = isAnime ? `/anime?genre=${g.id}` : `${targetRoute}?genre=${g.id}`;
                const isHighlight = isAnime && g.id === 16;
                return (
                  <Link
                    key={g.id}
                    href={genreHref}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      isHighlight
                        ? "bg-[#FF6400]/15 text-[#FF6400] border border-[#FF6400]/40 font-bold shadow-sm hover:bg-[#FF6400]/25"
                        : "text-zinc-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {g.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Action Buttons: Watch Now, Download & Subtitles Trigger */}
          {tmdbId && (
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {showWatchNow && (
                <Link
                  href={resolvedWatchHref}
                  onClick={handleWatchClick}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                    isAnime
                      ? "bg-[#FF6400] hover:bg-[#ff7b1a] text-black shadow-[#FF6400]/25"
                      : "bg-white hover:bg-zinc-200 text-black shadow-white/10"
                  }`}
                  title="Watch Now"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                  <span>Watch Now</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => setDownloadOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] transition-all cursor-pointer"
                title="Download Video & Subtitle"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download</span>
              </button>

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(title.replace(/[:\/\\#?&]/g, " ").replace(/\s+/g, " ").trim() + " subtitle indonesia srt download")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-white bg-red-600/15 hover:bg-red-600 border border-red-500/30 transition-all cursor-pointer"
                title="Unduh Subtitle Indonesia (.SRT) Langsung"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect width="20" height="15" x="2" y="4.5" rx="2" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                  <line x1="7" y1="15" x2="13" y2="15" />
                </svg>
                <span>Unduh Sub Indo</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Synopsis Paragraph with "Show more / Show less" Toggle */}
      {overview && (
        <div className="mt-6 pt-5 border-t border-white/[0.06]">
          <p
            className={`text-sm sm:text-base text-zinc-300/90 leading-relaxed font-normal ${
              showMore ? "line-clamp-none" : "line-clamp-3"
            }`}
          >
            {overview}
          </p>

          {overview.length > 180 && (
            <button
              type="button"
              onClick={() => setShowMore((prev) => !prev)}
              className="text-sm font-bold text-white hover:text-zinc-300 mt-2.5 inline-block cursor-pointer transition-colors focus:outline-none"
            >
              {showMore ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* CAST Section */}
      {cast.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <h2 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-4">
            CAST
          </h2>

          <div
            className="flex items-start gap-4 sm:gap-5 overflow-x-auto pb-2 scroll-snap-x"
            style={{ scrollbarWidth: "none" }}
            role="list"
          >
            {cast.map((actor) => (
              <div
                key={actor.id}
                className="shrink-0 w-20 sm:w-24 text-center scroll-snap-item flex flex-col items-center"
              >
                {/* Circular Avatar Photo */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2 border border-white/10 bg-[#1e2029] shadow-md flex items-center justify-center">
                  {actor.profile_path ? (
                    <Image
                      src={img(actor.profile_path, "w185")}
                      alt={actor.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized={!actor.profile_path}
                    />
                  ) : (
                    /* Blank / subtle placeholder circle matching reference screenshot */
                    <div className="w-full h-full rounded-full bg-[#272a36] flex items-center justify-center text-zinc-500">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Actor Name */}
                <span className="text-xs font-semibold text-white truncate max-w-[80px] sm:max-w-[90px] block leading-snug">
                  {actor.name}
                </span>

                {/* Character Name */}
                {actor.character && (
                  <span className="text-[11px] text-zinc-400 truncate max-w-[80px] sm:max-w-[90px] block mt-0.5 leading-snug">
                    {actor.character}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tmdbId && (
        <DownloadModal
          isOpen={downloadOpen}
          onClose={() => setDownloadOpen(false)}
          tmdbId={tmdbId}
          type={type}
          title={title}
          posterPath={posterPath}
        />
      )}
    </div>
  );
}
