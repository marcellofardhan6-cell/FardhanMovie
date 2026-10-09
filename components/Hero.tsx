"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Movie, backdrop, img, displayTitle, displayYear, isTV, getGenreNames } from "@/lib/tmdb";
import FavoriteButton from "./FavoriteButton";
import TrailerModal from "./TrailerModal";
import DetailModal from "./DetailModal";

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
  const [detailOpen, setDetailOpen] = useState(false);
  const [clientLogos, setClientLogos] = useState<Record<number, string | null>>({});

  const currentItem = heroList[currentIndex] || heroList[0];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % heroList.length);
  }, [heroList.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + heroList.length) % heroList.length);
  }, [heroList.length]);

  // Client-side fallback: fetch logo if not already attached on server
  useEffect(() => {
    heroList.forEach(async (m) => {
      if (m.logo_path || clientLogos[m.id] !== undefined) return;
      try {
        const mType = m.media_type === "tv" || (!m.title && m.name) ? "tv" : "movie";
        const res = await fetch(`/api/logo?id=${m.id}&type=${mType}`);
        const data = await res.json();
        setClientLogos((prev) => ({ ...prev, [m.id]: data.logoPath ?? null }));
      } catch {
        setClientLogos((prev) => ({ ...prev, [m.id]: null }));
      }
    });
  }, [heroList, clientLogos]);

  // Silky-smooth auto-advance slides every 5 seconds
  useEffect(() => {
    if (heroList.length <= 1 || trailerOpen || detailOpen) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroList.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [heroList.length, trailerOpen, detailOpen, currentIndex]);

  if (!currentItem) return null;

  const title = displayTitle(currentItem);
  const year = displayYear(currentItem);
  const isSeries = currentItem.media_type === "tv" || isTV(currentItem);
  const type = isSeries ? "series" : "movie";
  const mediaType: "movie" | "tv" = isSeries ? "tv" : "movie";
  const href = `/${type === "movie" ? "film" : "series"}/${currentItem.id}`;
  const rating = currentItem.vote_average ? currentItem.vote_average.toFixed(1) : null;
  const genres = getGenreNames(currentItem.genre_ids, 2);
  const currentLogo = currentItem.logo_path || clientLogos[currentItem.id];

  return (
    <>
      <section
        className="relative w-full overflow-hidden select-none group/hero h-[66vh] sm:h-[72vh] min-h-[480px] sm:min-h-[520px] max-h-[580px] sm:max-h-[620px] bg-[#06070a]"
        aria-label={`Featured: ${title}`}
      >
        {/* Full Backdrop / Poster with smooth cross-fade */}
        {heroList.map((m, idx) => {
          const isCurrent = idx === currentIndex;
          const bgPoster = m.poster_path ? img(m.poster_path, "original") : null;
          const bgBackdrop = m.backdrop_path ? backdrop(m.backdrop_path) : null;

          return (
            <div
              key={`hero-bg-${m.id}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isCurrent ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Mobile View: Vertical Poster fits portrait phone screens perfectly without cutting off character sides */}
              {bgPoster ? (
                <div className="block sm:hidden absolute inset-0">
                  <Image
                    src={bgPoster}
                    alt={`Poster ${displayTitle(m)}`}
                    fill
                    priority={idx === 0}
                    className="object-cover object-[center_top]"
                    sizes="100vw"
                  />
                </div>
              ) : bgBackdrop ? (
                <div className="block sm:hidden absolute inset-0">
                  <Image
                    src={bgBackdrop}
                    alt={`Backdrop ${displayTitle(m)}`}
                    fill
                    priority={idx === 0}
                    className="object-cover object-[center_top]"
                    sizes="100vw"
                  />
                </div>
              ) : null}

              {/* Tablet & Desktop View: Wide Landscape Backdrop pinned to top-center so heads/faces are never cut off */}
              {bgBackdrop ? (
                <div className="hidden sm:block absolute inset-0">
                  <Image
                    src={bgBackdrop}
                    alt={`Backdrop ${displayTitle(m)}`}
                    fill
                    priority={idx === 0}
                    className="object-cover object-[center_top] md:object-[center_15%]"
                    sizes="100vw"
                  />
                </div>
              ) : bgPoster ? (
                <div className="hidden sm:block absolute inset-0">
                  <Image
                    src={bgPoster}
                    alt={`Poster ${displayTitle(m)}`}
                    fill
                    priority={idx === 0}
                    className="object-cover object-[center_top]"
                    sizes="100vw"
                  />
                </div>
              ) : null}

              {/* Subtle top shade for navbar legibility */}
              <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/75 via-black/35 to-transparent pointer-events-none" />

              {/* Bottom smooth dark vignette into page content (focused on bottom 35% where text sits) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/80 via-30% to-transparent pointer-events-none" />

              {/* Left focused vignette behind movie logo and details */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#06070a]/90 via-[#06070a]/40 to-transparent max-w-2xl pointer-events-none" />
            </div>
          );
        })}

        {/* Hero Content Container */}
        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end z-10 h-full pb-6 sm:pb-8 pt-16 sm:pt-20"
        >
          <div className="w-full max-w-2xl mx-auto md:mx-0 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Tag / Category Badge */}
            <div className="inline-flex items-center gap-2 mb-1.5 sm:mb-2">
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors ${
                  isAnimePage ? "bg-[#FF6400] text-black" : "bg-red-600 text-white"
                }`}
              >
                {isAnimePage ? "Anime Spotlight" : "Top Featured"}
              </span>
              <span className="text-xs text-zinc-400 font-semibold">
                #{currentIndex + 1} Spotlight
              </span>
            </div>

            {/* Title: Official TMDB Graphic Logo (if available) or Stylized Fraunces Typography */}
            <div className="mb-2 sm:mb-2.5 min-h-[44px] sm:min-h-[56px] md:min-h-[68px] flex items-center justify-center md:justify-start">
              {currentLogo ? (
                <div className="relative h-11 sm:h-14 md:h-16 max-w-[220px] sm:max-w-[280px] md:max-w-[340px] w-auto">
                  <Image
                    key={`hero-logo-${currentItem.id}`}
                    src={`https://image.tmdb.org/t/p/w500${currentLogo}`}
                    alt={`Logo ${title}`}
                    width={340}
                    height={85}
                    priority={currentIndex === 0}
                    className="h-full w-auto max-h-11 sm:max-h-14 md:max-h-16 object-contain object-center md:object-left drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] animate-fade-in"
                  />
                </div>
              ) : (
                <h1
                  className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl animate-fade-in"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {title}
                </h1>
              )}
            </div>

            {/* Metadata Row matching 7reels / Netflix aesthetic */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 mb-2 sm:mb-2.5 text-xs sm:text-sm font-semibold text-zinc-300">
              {rating && (
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <span className="text-sm">★</span>
                  <span>{rating}</span>
                </span>
              )}
              {year && <span>{year}</span>}
              <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold text-zinc-300 border border-white/20 bg-black/40">
                17+
              </span>
              {genres && (
                <span className="text-zinc-400 text-xs sm:text-sm">
                  {genres}
                </span>
              )}
            </div>

            {/* Synopsis */}
            {currentItem.overview && (
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-300/90 mb-3 sm:mb-3.5 line-clamp-2 max-w-lg font-normal">
                {currentItem.overview}
              </p>
            )}

            {/* Action Buttons: Watch Now & More Info (Detail Modal) */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 mt-0.5">
              {/* Watch Now */}
              <Link
                href={href}
                className={`inline-flex items-center justify-center gap-2 font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xl active:scale-95 cursor-pointer ${
                  isAnimePage
                    ? "bg-[#FF6400] hover:bg-[#ff7b1a] text-black shadow-[#FF6400]/25"
                    : "bg-white hover:bg-zinc-200 text-black shadow-white/10"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
                <span>Watch Now</span>
              </Link>

              {/* More Info (Opens Detail Modal) */}
              <button
                type="button"
                onClick={() => setDetailOpen(true)}
                className="inline-flex items-center justify-center gap-2 font-semibold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm bg-zinc-900/80 hover:bg-zinc-800 text-white backdrop-blur-md border border-white/15 hover:border-white/30 transition-all active:scale-95 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>More Info</span>
              </button>

              {/* Trailer Button */}
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="hidden sm:inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white font-semibold px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm backdrop-blur-md border border-white/10 hover:border-white/20 transition-all active:scale-95 cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
                <span>Trailer</span>
              </button>

              {/* Favorite / My List */}
              <FavoriteButton
                item={currentItem}
                showText={false}
                activeText="In List"
                inactiveText="My List"
                iconType="plus"
                className="!bg-white/10 hover:!bg-white/20 !text-white !backdrop-blur-md !border-white/15 !rounded-xl p-2 sm:p-2.5 font-semibold text-xs active:scale-95"
              />
            </div>
          </div>
        </div>

        {/* Slide Indicator Dots (Bottom Right matching 7reels layout) */}
        {heroList.length > 1 && (
          <div
            className="absolute bottom-4 sm:bottom-5 right-4 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2"
            aria-label="Slide indicators"
          >
            {heroList.map((m, idx) => (
              <button
                key={`dot-${m.id}`}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}: ${displayTitle(m)}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? isAnimePage
                      ? "w-6 sm:w-8 h-1.5 bg-[#FF6400] shadow-[0_0_10px_rgba(255,100,0,0.6)]"
                      : "w-6 sm:w-8 h-1.5 bg-white shadow-sm"
                    : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/35 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Official YouTube Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={title}
        tmdbId={Number(currentItem.id)}
        type={mediaType}
      />

      {/* Netflix-Style Detail Modal */}
      <DetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        item={currentItem}
        isAnime={isAnimePage}
      />
    </>
  );
}
