"use client";

import Link from "next/link";
import Image from "next/image";
import { Movie, img, displayTitle, displayYear, isTV } from "@/lib/tmdb";
import { useFavorites } from "@/context/FavoritesContext";

interface Props {
  item: Movie;
  rank: number;
  priority?: boolean;
}

export default function Top10Card({ item, rank, priority = false }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(item.id);
  const title = displayTitle(item);
  const year = displayYear(item);
  const type = item.media_type === "tv" || isTV(item) ? "series" : "movie";
  const href = `/${type === "movie" ? "film" : "series"}/${item.id}`;
  const posterUrl = img(item.poster_path, "w342");
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <Link
      href={href}
      className="group flex items-end relative transition-all duration-300 ease-out hover:-translate-y-2 select-none"
      aria-label={`Rank ${rank}: ${title}${year ? " (" + year + ")" : ""}`}
    >
      {/* Giant Stylized Rank Number */}
      <div className="relative shrink-0 z-0 transform transition-transform duration-300 group-hover:scale-105">
        <svg
          viewBox={rank === 10 ? "0 0 115 125" : "0 0 75 125"}
          className="h-[125px] sm:h-[155px] md:h-[175px] w-auto pointer-events-none drop-shadow-lg"
          aria-hidden="true"
        >
          <text
            x="50%"
            y="110"
            textAnchor="middle"
            fontSize="125"
            fontWeight="950"
            fill="#07080c"
            stroke="#474b59"
            strokeWidth="4.5"
            strokeLinejoin="round"
            className="transition-colors duration-300 group-hover:stroke-red-500"
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {rank}
          </text>
        </svg>
      </div>

      {/* Poster with Overlap */}
      <div
        className="relative z-10 -ml-4 sm:-ml-6 md:-ml-7 w-[115px] sm:w-[140px] md:w-[160px] aspect-[2/3] rounded-xl overflow-hidden bg-[#0d0f15] border border-white/10 shadow-2xl transition-all duration-300 group-hover:border-red-500/50 group-hover:shadow-[0_8px_25px_rgba(229,9,20,0.25)]"
      >
        <Image
          src={posterUrl}
          alt={`Poster ${title}`}
          fill
          sizes="(max-width: 640px) 35vw, (max-width: 1024px) 20vw, 170px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
          priority={priority}
          unoptimized={posterUrl.startsWith("/")}
        />

        {/* Ambient Dark Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />

        {/* Floating Top Rating Badge */}
        {rating && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight backdrop-blur-md bg-black/75 text-zinc-100 border border-white/10"
          >
            <span className="text-red-500 text-[11px]">★</span>
            <span>{rating}</span>
          </div>
        )}

        {/* Floating Favorite Heart Icon */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(item);
          }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 cursor-pointer ${
            fav
              ? "bg-red-600/90 text-white border-red-500 shadow-md"
              : "bg-black/60 text-zinc-300 border-white/10 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-black/90"
          }`}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          title={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill={fav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {/* Bottom Title on Poster */}
        <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5">
          <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-medium">
            <span>{type === "series" ? "Series" : "Movie"}</span>
            {year && <span>• {year}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
