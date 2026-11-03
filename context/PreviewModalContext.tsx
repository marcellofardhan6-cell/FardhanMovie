"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Movie } from "@/lib/tmdb";

interface PreviewModalContextValue {
  isOpen: boolean;
  activeItem: Movie | null;
  autoPlay: boolean;
  isPlaying: boolean;
  initialSeason: number;
  initialEpisode: number;
  initialDetailData?: any;
  openPreview: (
    item: Movie,
    autoPlay?: boolean,
    season?: number,
    episode?: number,
    cachedDetail?: any
  ) => void;
  closePreview: () => void;
  setIsPlaying: (playing: boolean) => void;
}

const PreviewModalContext = createContext<PreviewModalContextValue | undefined>(undefined);

export function PreviewModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<Movie | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [initialSeason, setInitialSeason] = useState(1);
  const [initialEpisode, setInitialEpisode] = useState(1);
  const [initialDetailData, setInitialDetailData] = useState<any>(null);

  const openPreview = useCallback(
    (
      item: Movie,
      autoPlayFlag: boolean = false,
      season?: number,
      episode?: number,
      cachedDetail?: any
    ) => {
      setActiveItem(item);
      setAutoPlay(autoPlayFlag);
      setIsPlaying(autoPlayFlag);
      if (season !== undefined) setInitialSeason(season);
      else setInitialSeason(1);
      if (episode !== undefined) setInitialEpisode(episode);
      else setInitialEpisode(1);
      if (cachedDetail !== undefined) setInitialDetailData(cachedDetail);
      setIsOpen(true);
    },
    []
  );

  const closePreview = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("fardtv_preview_state");
        sessionStorage.removeItem("fardtv_active_session");
        sessionStorage.removeItem("fardtv_active_server");
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("movie");
        currentUrl.searchParams.delete("series");
        currentUrl.searchParams.delete("play");
        currentUrl.searchParams.delete("season");
        currentUrl.searchParams.delete("episode");
        currentUrl.searchParams.delete("server");
        currentUrl.searchParams.delete("startAt");
        window.history.replaceState(
          {},
          "",
          currentUrl.pathname + (currentUrl.search ? currentUrl.search : "") + currentUrl.hash
        );
      } catch {}
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("preview-loading-ssr");
      }
    }
    setIsOpen(false);
    setIsPlaying(false);
    setAutoPlay(false);
    setActiveItem(null);
    setInitialDetailData(null);
    setInitialSeason(1);
    setInitialEpisode(1);
  }, []);

  return (
    <PreviewModalContext.Provider
      value={{
        isOpen,
        activeItem,
        autoPlay,
        isPlaying,
        initialSeason,
        initialEpisode,
        initialDetailData,
        openPreview,
        closePreview,
        setIsPlaying,
      }}
    >
      {children}
    </PreviewModalContext.Provider>
  );
}

export function usePreviewModal() {
  const context = useContext(PreviewModalContext);
  if (!context) {
    throw new Error("usePreviewModal must be used within a PreviewModalProvider");
  }
  return context;
}
