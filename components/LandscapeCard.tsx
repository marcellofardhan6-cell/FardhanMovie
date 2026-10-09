"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Movie, backdrop, img, displayTitle, displayYear, isTV } from "@/lib/tmdb";
import { useFavorites } from "@/context/FavoritesContext";

interface Props {
  item: Movie;
  priority?: boolean;
}

export default function LandscapeCard({ item, priority = false }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(item.id);
  const title = displayTitle(item);
  const year = displayYear(item);
  const type = item.media_type === "tv" || isTV(item) ? "series" : "movie";
  const href = `/${type === "movie" ? "film" : "series"}/${item.id}`;
  const imageUrl = item.backdrop_path
    ? backdrop(item.backdrop_path)
    : img(item.poster_path, "w500");
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <Link
      href={href}
      className="group block relative rounded-xl overflow-hidden bg-[#0c0e15] border border-white/[0.08] hover:border-red-500/40 transition-all duration-300 ease-out hover:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-red-500 shadow-lg select-none"
      aria-label={`${title}${year ? " (" + year + ")" : ""}`}
    >
      {/* 16:9 Backdrop Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#11141e]">
        <Image
          src={imgSrc}
          alt={`Backdrop ${title}`}
          fill
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 35vw, 320px"
          className="object-cover object-[center_top] transition-transform duration-500 ease-out group-hover:scale-106"
          priority={priority}
          onError={() => setImgSrc("/backdrop-placeholder.svg")}
        />

        {/* Ambient Dark Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e15] via-transparent to-black/30 opacity-80 group-hover:opacity-40 transition-opacity" />

        {/* Center Play Button Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
        </div>

        {/* Rating Badge Top-Left */}
        {rating && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold tracking-tight backdrop-blur-md bg-black/75 text-zinc-100 border border-white/10">
            <span className="text-red-500 text-xs">★</span>
            <span>{rating}</span>
          </div>
        )}

        {/* Favorite Button Top-Right */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(item);
          }}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 cursor-pointer ${
            fav
              ? "bg-red-600 text-white border-red-500 shadow-md"
              : "bg-black/60 text-zinc-300 border-white/10 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-black/90"
          }`}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill={fav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {/* Type & HD Badge Bottom-Right */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-semibold uppercase text-zinc-300 border border-white/15">
            {type === "series" ? "Series" : "Movie"}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono text-zinc-400 border border-white/15">
            HD
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
          {year && <span>{year}</span>}
          {item.overview && (
            <>
              <span>•</span>
              <span className="line-clamp-1 text-[11px] text-zinc-500 flex-1">
                {item.overview}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
