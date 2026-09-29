"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Movie, isTV } from "@/lib/tmdb";

export interface FavoriteItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isFavorite: (id: number | string) => boolean;
  toggleFavorite: (item: FavoriteItem | Movie) => void;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  favoritesCount: 0,
});

const STORAGE_KEY = "fardtv_favorites_v1";
const LEGACY_STORAGE_KEY = "fardhanflix_favorites_v1";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when favorites change (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites to localStorage:", e);
    }
  }, [favorites, isLoaded]);

  const isFavorite = useCallback(
    (id: number | string) => {
      const numId = Number(id);
      return favorites.some((item) => item.id === numId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback((item: FavoriteItem | Movie) => {
    const numId = Number(item.id);
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === numId);
      if (exists) {
        return prev.filter((fav) => fav.id !== numId);
      } else {
        const resolvedType = item.media_type || (isTV(item as Movie) ? "tv" : "movie");
        const newItem: FavoriteItem = {
          id: numId,
          title: item.title,
          name: item.name,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          vote_average: item.vote_average ?? 0,
          vote_count: item.vote_count ?? 0,
          release_date: item.release_date,
          first_air_date: item.first_air_date,
          media_type: resolvedType,
        };
        return [newItem, ...prev];
      }
    });
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
