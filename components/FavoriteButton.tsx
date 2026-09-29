"use client";

import { useFavorites } from "@/context/FavoritesContext";
import { Movie } from "@/lib/tmdb";

interface Props {
  item: Movie;
  className?: string;
  showText?: boolean;
}

export default function FavoriteButton({ item, className = "", showText = false }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(item.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(item);
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer ${
        fav
          ? "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/30 border border-red-500"
          : "bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/[0.1]"
      } ${className}`}
      aria-label={fav ? "Remove from Favorites" : "Add to Favorites"}
      title={fav ? "Remove from Favorites" : "Add to Favorites"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={fav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-200 ${fav ? "scale-110" : ""}`}
        aria-hidden
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
      {showText && (
        <span className="text-xs font-semibold">
          {fav ? "In Favorites" : "Favorite"}
        </span>
      )}
    </button>
  );
}
