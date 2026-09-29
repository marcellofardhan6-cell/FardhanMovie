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
}

interface WatchHistoryContextType {
  history: WatchHistoryItem[];
  addHistory: (item: Omit<WatchHistoryItem, "updatedAt">) => void;
  removeHistory: (id: number, type: "movie" | "tv") => void;
  clearHistory: () => void;
  isLoaded: boolean;
}

const WatchHistoryContext = createContext<WatchHistoryContextType>({
  history: [],
  addHistory: () => {},
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
      console.error("Gagal memuat riwayat tonton dari localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Gagal menyimpan riwayat tonton ke localStorage:", e);
    }
  }, [history, isLoaded]);

  const addHistory = useCallback((item: Omit<WatchHistoryItem, "updatedAt">) => {
    setHistory((prev) => {
      const filtered = prev.filter(
        (existing) => !(existing.id === item.id && existing.type === item.type)
      );
      const newItem: WatchHistoryItem = {
        ...item,
        updatedAt: Date.now(),
      };
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

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
