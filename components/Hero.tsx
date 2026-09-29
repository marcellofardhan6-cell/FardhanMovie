import Link from "next/link";
import Image from "next/image";
import { Movie, backdrop, displayTitle, displayYear, isTV } from "@/lib/tmdb";
import FavoriteButton from "./FavoriteButton";

interface Props {
  item: Movie;
}

export default function Hero({ item }: Props) {
  const title = displayTitle(item);
  const year = displayYear(item);
  const type = item.media_type === "tv" || isTV(item) ? "series" : "movie";
  const href = `/${type === "movie" ? "film" : "series"}/${item.id}`;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "560px", background: "#06070a" }}
      aria-label={`Featured: ${title}`}
    >
      {/* Full Backdrop with deep vignette */}
      {item.backdrop_path && (
        <div className="absolute inset-0">
          <Image
            src={backdrop(item.backdrop_path)}
            alt={`Backdrop ${title}`}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Smooth bottom-to-top vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/60 to-black/30" />
          {/* Side gradient for widescreen desktop only */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#06070a] via-[#06070a]/80 to-transparent sm:w-2/3" />
        </div>
      )}

      {/* Hero Content Container */}
      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end"
        style={{ minHeight: "560px", paddingBottom: "2rem", paddingTop: "5rem" }}
      >
        {/* On mobile: Centered 7reels style. On desktop: Left-aligned Netflix style */}
        <div className="w-full max-w-2xl mx-auto md:mx-0 flex flex-col items-center md:items-start text-center md:text-left">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-2 sm:mb-3 drop-shadow-2xl">
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
              {type === "movie" ? "Movie" : "TV Series"}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-zinc-400 font-mono border border-white/15">
              HD
            </span>
          </div>

          {/* Synopsis (Hidden on mobile for sleek 7reels poster banner, visible on desktop) */}
          {item.overview && (
            <p className="hidden md:block text-sm sm:text-base leading-relaxed text-zinc-300/90 mb-6 line-clamp-3 max-w-xl font-normal">
              {item.overview}
            </p>
          )}

          {/* Action Buttons: Mobile 7reels Pill Style vs Desktop Classic */}
          {/* Mobile Buttons (< md): Rounded-full Play & + My List */}
          <div className="flex md:hidden items-center justify-center gap-3 w-full max-w-xs mt-1">
            <Link
              href={href}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold px-6 py-2.5 rounded-full text-sm transition-all shadow-xl active:scale-95 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              <span>Play</span>
            </Link>

            <FavoriteButton
              item={item}
              showText={true}
              activeText="In List"
              inactiveText="My List"
              iconType="plus"
              className="flex-1 !bg-white/20 hover:!bg-white/30 !text-white !backdrop-blur-md !border-white/20 !rounded-full px-5 py-2.5 font-semibold text-sm active:scale-95 shadow-lg"
            />
          </div>

          {/* Desktop Buttons (>= md): Classic Netflix / FardhanFlix Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={href}
              className="inline-flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold px-6 py-2.5 rounded-md text-sm transition-colors shadow-lg cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              <span>Play Now</span>
            </Link>

            <Link
              href={href}
              className="inline-flex items-center gap-2 bg-zinc-700/60 hover:bg-zinc-700/80 text-white font-medium px-5 py-2.5 rounded-md text-sm backdrop-blur-sm transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>More Details</span>
            </Link>

            <FavoriteButton item={item} className="px-3 py-2.5 !rounded-md" />
          </div>

          {/* 7reels-style Slide Indicators (Mobile Only) */}
          <div className="flex md:hidden items-center justify-center gap-1.5 mt-5" aria-hidden>
            <span className="w-5 h-1.5 rounded-full bg-white shadow-sm" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
