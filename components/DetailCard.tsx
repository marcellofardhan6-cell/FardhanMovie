"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/tmdb";

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Props {
  title?: string;
  posterPath?: string | null;
  rating?: number;
  runtime?: string | null;
  year?: string | null;
  genres?: { id: number; name: string }[];
  overview?: string | null;
  cast?: CastMember[];
  type?: "movie" | "tv";
  isUnreleased?: boolean;
  releaseDateText?: string | null;
}

export default function DetailCard({
  title = "Untitled",
  posterPath = null,
  rating = 0,
  runtime,
  year,
  genres = [],
  overview,
  cast = [],
  type = "movie",
  isUnreleased = false,
  releaseDateText,
}: Props) {
  const [showMore, setShowMore] = useState(false);

  const displayRating = rating > 0 ? rating.toFixed(1) : null;
  const targetRoute = type === "tv" ? "/series" : "/films";

  return (
    <div className="rounded-2xl bg-[#0d0f16] border border-white/[0.08] p-6 sm:p-8 shadow-2xl text-zinc-200">
      {/* Top Row: Poster on Left, Title & Meta on Right (Matching media_1790663254230.png) */}
      <div className="flex flex-row gap-5 sm:gap-7 items-start">
        {/* Poster Thumbnail */}
        <div className="relative w-24 sm:w-32 md:w-36 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#161922]">
          <Image
            src={img(posterPath, "w500")}
            alt={`Poster ${title}`}
            fill
            className="object-cover"
            priority
            unoptimized={!posterPath}
          />
          {isUnreleased && (
            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black shadow-lg shadow-amber-500/50">
              COMING SOON
            </div>
          )}
        </div>

        {/* Title, Rating, Meta & Genre Badges */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Unreleased COMING SOON Banner Tag */}
          {isUnreleased && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-black uppercase tracking-wider text-amber-200">COMING SOON</span>
              {releaseDateText && (
                <span className="text-[11px] text-amber-300/80 font-normal">• Rilis: {releaseDateText}</span>
              )}
            </div>
          )}

          {/* Film / Series Title */}
          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mb-2 leading-tight">
            {title}
          </h1>

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
              {genres.map((g) => (
                <Link
                  key={g.id}
                  href={`${targetRoute}?genre=${g.id}`}
                  className="px-3 py-1 rounded-full text-xs font-medium text-zinc-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 hover:text-white transition-colors cursor-pointer"
                >
                  {g.name}
                </Link>
              ))}
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
    </div>
  );
}
