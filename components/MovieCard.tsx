"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Movie, img, displayTitle, displayYear, isTV } from "@/lib/tmdb";
import { useFavorites } from "@/context/FavoritesContext";
import { usePreviewModal } from "@/context/PreviewModalContext";

interface Props {
  item: Movie;
  priority?: boolean;
}

export default function MovieCard({ item, priority = false }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { openPreview } = usePreviewModal();
  const fav = isFavorite(item.id);
  const title = displayTitle(item);
  const year = displayYear(item);
  const type = item.media_type === "tv" || isTV(item) ? "series" : "movie";
  const href = `/${type === "movie" ? "film" : "series"}/${item.id}`;
  const posterUrl = img(item.poster_path, "w780");
  const [imgSrc, setImgSrc] = useState(posterUrl);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    openPreview(item, false);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openPreview(item, true);
  };

  return (
    <Link
      href={href}
      onClick={handleCardClick}
      className="group block relative rounded-xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer select-none"
      style={{
        background: "var(--surface)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
      aria-label={`${title}${year ? " (" + year + ")" : ""}${rating ? ", rating " + rating : ""}`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-[#0d0f15]">
        <Image
          src={imgSrc}
          alt={`Poster ${title}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
          priority={priority}
          onError={() => setImgSrc("/poster-placeholder.svg")}
        />

        {/* Ambient Dark Gradient Base (Reveals on Hover for Text Contrast, always active on mobile) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

        {/* Floating Top Rating Badge */}
        {rating && (
          <div
            className="absolute top-2 left-2 z-20 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight backdrop-blur-md bg-black/75 text-zinc-100 border border-white/10"
          >
            <span className="text-red-500 text-[11px]">★</span>
            <span>{rating}</span>
          </div>
        )}

        {/* Quality Badge (Ngefilm21 Style: WEB-DL / BluRay) - Desktop Idle State */}
        <div className="hidden sm:block absolute bottom-2 left-2 z-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-emerald-600/90 text-white shadow-md border border-emerald-400/30 backdrop-blur-sm">
            {item.vote_count && item.vote_count > 100 && year && Number(year) < 2024 ? "BluRay" : "WEB-DL"}
          </span>
        </div>

        {/* Floating Favorite Heart Icon Top-Right (Always Visible & Clickable) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(item);
          }}
          className={`absolute top-2 right-2 z-30 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 cursor-pointer shadow-md active:scale-90 hover:scale-110 ${
            fav
              ? "bg-red-600 text-white border-red-500 shadow-red-900/40"
              : "bg-black/60 text-zinc-300 border-white/15 hover:text-white hover:bg-black/85"
          }`}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          title={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={fav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${fav ? "scale-105" : ""}`}
            aria-hidden
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {/* Center Play Button Reveal on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[1px] z-20 pointer-events-none">
          <button
            type="button"
            onClick={handlePlayClick}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-red-600 text-white shadow-[0_0_25px_rgba(229,9,20,0.8)] transform scale-90 group-hover:scale-100 hover:scale-110 hover:bg-red-500 transition-all duration-200 cursor-pointer pointer-events-auto"
            aria-label="Play movie directly"
            title="Play Now"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5" aria-hidden>
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </button>
        </div>

        {/* Bottom Title & Details on Poster (Always Visible on Mobile, Hover on Desktop) */}
        <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 z-20 pointer-events-none transform translate-y-0 sm:translate-y-2 opacity-100 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase tracking-wide bg-emerald-600/90 text-white shadow-sm border border-emerald-400/30">
              {item.vote_count && item.vote_count > 100 && year && Number(year) < 2024 ? "BluRay" : "WEB-DL"}
            </span>
            <span className="text-[9px] text-zinc-300 font-medium">
              {type === "series" ? "Series" : "Movie"}
            </span>
            {year && <span className="text-[9px] text-zinc-400">• {year}</span>}
          </div>
          <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors drop-shadow-md">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
