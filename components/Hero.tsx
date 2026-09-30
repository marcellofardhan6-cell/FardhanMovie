"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Movie, backdrop, displayTitle, displayYear, isTV } from "@/lib/tmdb";
import FavoriteButton from "./FavoriteButton";
import TrailerModal from "./TrailerModal";

interface Props {
  items?: Movie[];
  item?: Movie;
  isAnime?: boolean;
}

export default function Hero({ items, item, isAnime }: Props) {
  const pathname = usePathname();
  const isAnimePage = isAnime || pathname === "/anime" || pathname?.startsWith("/anime");

  // Normalize items to an array of up to 5 featured titles with backdrops
  const heroList = (
    items && items.length > 0
      ? items.filter((m) => m.backdrop_path).slice(0, 5)
      : item
      ? [item]
      : []
  ) as Movie[];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = heroList[currentIndex] || heroList[0];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroList.length);
  }, [heroList.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + heroList.length) % heroList.length);
  }, [heroList.length]);

  // Auto-advance slides every 7 seconds when not paused
  useEffect(() => {
    if (heroList.length <= 1 || isPaused || trailerOpen) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [heroList.length, isPaused, trailerOpen, nextSlide]);

  if (!currentItem) return null;

  const title = displayTitle(currentItem);
  const year = displayYear(currentItem);
  const isSeries = currentItem.media_type === "tv" || isTV(currentItem);
  const type = isSeries ? "series" : "movie";
  const mediaType: "movie" | "tv" = isSeries ? "tv" : "movie";
  const href = `/${type === "movie" ? "film" : "series"}/${currentItem.id}`;
  const rating = currentItem.vote_average ? currentItem.vote_average.toFixed(1) : null;

  return (
    <>
      <section
        className="relative w-full overflow-hidden select-none group/hero"
        style={{ minHeight: "580px", background: "#06070a" }}
        aria-label={`Featured: ${title}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Full Backdrop with smooth cross-fade */}
        {heroList.map((m, idx) => (
          <div
            key={`hero-bg-${m.id}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
            }`}
          >
            {m.backdrop_path && (
              <Image
                src={backdrop(m.backdrop_path)}
                alt={`Backdrop ${displayTitle(m)}`}
                fill
                priority={idx === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            )}
            {/* Smooth bottom-to-top vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/65 to-black/30" />
            {/* Side gradient for widescreen desktop only */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#06070a] via-[#06070a]/85 to-transparent sm:w-2/3" />
          </div>
        ))}

        {/* Hero Content Container */}
        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end z-10"
          style={{ minHeight: "580px", paddingBottom: "2.5rem", paddingTop: "5.5rem" }}
        >
          <div className="w-full max-w-2xl mx-auto md:mx-0 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Tag / Category Badge */}
            <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
              <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                {isAnimePage ? "Anime Spotlight" : "Top Featured"}
              </span>
              <span className="text-xs text-zinc-400 font-semibold">
                #{currentIndex + 1} Spotlight
              </span>
            </div>

            {/* Title with smooth transition */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.08] mb-2 sm:mb-3 drop-shadow-2xl">
              {title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-4 text-xs font-semibold text-zinc-300">
              {rating && (
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <span className="text-sm">★</span>
                  <span>{rating}</span>
                </span>
              )}
              {year && <span>{year}</span>}
              <span className="text-zinc-500">•</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-zinc-300 border border-white/15">
                {isAnimePage ? "Serial Anime" : type === "movie" ? "Film" : "Serial TV"}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-zinc-400 font-mono border border-white/15">
                HD
              </span>
            </div>

            {/* Synopsis */}
            {currentItem.overview && (
              <p className="hidden md:block text-sm sm:text-base leading-relaxed text-zinc-300/90 mb-6 line-clamp-3 max-w-xl font-normal">
                {currentItem.overview}
              </p>
            )}

            {/* Action Buttons: Mobile Pill vs Desktop Grid */}
            {/* Mobile Buttons (< md) */}
            <div className="flex md:hidden flex-wrap items-center justify-center gap-2.5 w-full max-w-xs mt-1">
              <Link
                href={href}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold px-5 py-2.5 rounded-full text-sm transition-all shadow-xl active:scale-95 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
                <span>Play</span>
              </Link>

              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-2.5 rounded-full text-xs backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Trailer</span>
              </button>

              <FavoriteButton
                item={currentItem}
                showText={true}
                activeText="In List"
                inactiveText="My List"
                iconType="plus"
                className="!bg-white/15 hover:!bg-white/25 !text-white !backdrop-blur-md !border-white/20 !rounded-full px-4 py-2.5 font-semibold text-xs active:scale-95"
              />
            </div>

            {/* Desktop Buttons (>= md) */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href={href}
                className="inline-flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-black px-6 py-3 rounded-xl text-sm transition-all shadow-lg hover:shadow-white/10 active:scale-95 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
                <span>Watch Now</span>
              </Link>

              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="inline-flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700/90 text-white font-bold px-5 py-3 rounded-xl text-sm backdrop-blur-md border border-white/10 hover:border-white/25 transition-all active:scale-95 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
                <span>Trailer</span>
              </button>

              <Link
                href={href}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-4 py-3 rounded-xl text-sm backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span>Details</span>
              </Link>

              <FavoriteButton item={currentItem} className="px-3.5 py-3 !rounded-xl" />
            </div>

            {/* Slide Navigation & Controls (Cleanly positioned below buttons, never covers title) */}
            {heroList.length > 1 && (
              <div className="flex items-center gap-2.5 sm:gap-3 mt-6 sm:mt-7" aria-label="Hero slide navigation">
                {/* Prev Slide Arrow */}
                <button
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-red-600 text-white border border-white/15 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>

                {/* Dot Indicators */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {heroList.map((m, idx) => (
                    <button
                      key={`dot-${m.id}`}
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Jump to slide ${idx + 1}: ${displayTitle(m)}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentIndex
                          ? "w-7 sm:w-8 bg-red-600 shadow-md shadow-red-600/50"
                          : "w-2 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>

                {/* Next Slide Arrow */}
                <button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-red-600 text-white border border-white/15 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>

                {/* Slide Counter */}
                <span className="text-[11px] font-mono text-zinc-400 font-bold ml-1">
                  {currentIndex + 1} / {heroList.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Official YouTube Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={title}
        tmdbId={Number(currentItem.id)}
        type={mediaType}
      />
    </>
  );
}
