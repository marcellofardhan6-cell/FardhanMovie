"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WatchHistoryItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  season?: number;
  episode?: number;
  updatedAt: number;
  currentTime?: number; // Real seconds watched (e.g. 1540 = 25m 40s)
  duration?: number;    // Total duration in seconds (e.g. 7200 = 120m)
  progress?: number;    // Real percentage 0 - 100
}

interface WatchHistoryContextType {
  history: WatchHistoryItem[];
  addHistory: (item: Omit<WatchHistoryItem, "updatedAt">) => void;
  updateProgress: (
    id: number,
    type: "movie" | "tv",
    currentTime: number,
    duration?: number,
    meta?: {
      title?: string;
      poster_path?: string | null;
      backdrop_path?: string | null;
      season?: number;
      episode?: number;
    }
  ) => void;
  getHistoryItem: (
    id: number,
    type: "movie" | "tv",
    season?: number,
    episode?: number
  ) => WatchHistoryItem | undefined;
  removeHistory: (id: number, type: "movie" | "tv") => void;
  clearHistory: () => void;
  isLoaded: boolean;
}

const WatchHistoryContext = createContext<WatchHistoryContextType>({
  history: [],
  addHistory: () => {},
  updateProgress: () => {},
  getHistoryItem: () => undefined,
  removeHistory: () => {},
  clearHistory: () => {},
  isLoaded: false,
});

const STORAGE_KEY = "fardtv_watch_history_v1";
const LEGACY_STORAGE_KEY = "fardhanflix_watch_history_v1";
const MAX_HISTORY_ITEMS = 24;

export function WatchHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load watch history from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save watch history to localStorage:", e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [history, isLoaded]);

  const addHistory = useCallback((item: Omit<WatchHistoryItem, "updatedAt">) => {
    setHistory((prev) => {
      const existing = prev.find(
        (e) => e.id === item.id && e.type === item.type
      );
      const filtered = prev.filter(
        (e) => !(e.id === item.id && e.type === item.type)
      );
      const newItem: WatchHistoryItem = {
        ...existing,
        ...item,
        updatedAt: Date.now(),
      };
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  const updateProgress = useCallback(
    (
      id: number,
      type: "movie" | "tv",
      currentTime: number,
      duration?: number,
      meta?: {
        title?: string;
        poster_path?: string | null;
        backdrop_path?: string | null;
        season?: number;
        episode?: number;
      }
    ) => {
      setHistory((prev) => {
        const existing = prev.find((e) => e.id === id && e.type === type);
        // Throttle: don't re-render if difference is less than 8 seconds
        if (
          existing &&
          existing.currentTime !== undefined &&
          Math.abs(currentTime - existing.currentTime) < 8
        ) {
          return prev;
        }

        const effectiveDuration = duration && duration > 0 ? duration : existing?.duration;
        const progress =
          effectiveDuration && effectiveDuration > 0
            ? Math.min(100, Math.max(1, Math.round((currentTime / effectiveDuration) * 100)))
            : existing?.progress || 1;

        const updatedItem: WatchHistoryItem = {
          id,
          type,
          title: meta?.title || existing?.title || "Untitled",
          poster_path: meta?.poster_path !== undefined ? meta.poster_path : existing?.poster_path,
          backdrop_path: meta?.backdrop_path !== undefined ? meta.backdrop_path : existing?.backdrop_path,
          season: meta?.season !== undefined ? meta.season : existing?.season,
          episode: meta?.episode !== undefined ? meta.episode : existing?.episode,
          currentTime: Math.round(currentTime),
          duration: effectiveDuration ? Math.round(effectiveDuration) : undefined,
          progress,
          updatedAt: Date.now(),
        };

        const filtered = prev.filter((e) => !(e.id === id && e.type === type));
        return [updatedItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      });
    },
    []
  );

  const getHistoryItem = useCallback(
    (id: number, type: "movie" | "tv", season?: number, episode?: number) => {
      return history.find((e) => {
        if (e.id !== id || e.type !== type) return false;
        if (type === "tv" && (season !== undefined || episode !== undefined)) {
          if (season !== undefined && e.season !== season) return false;
          if (episode !== undefined && e.episode !== episode) return false;
        }
        return true;
      });
    },
    [history]
  );

  const removeHistory = useCallback((id: number, type: "movie" | "tv") => {
    setHistory((prev) =>
      prev.filter((existing) => !(existing.id === id && existing.type === type))
    );
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <WatchHistoryContext.Provider
      value={{
        history,
        addHistory,
        updateProgress,
        getHistoryItem,
        removeHistory,
        clearHistory,
        isLoaded,
      }}
    >
      {children}
    </WatchHistoryContext.Provider>
  );
}

export function useWatchHistory() {
  return useContext(WatchHistoryContext);
}
