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
  openPreview: (item: Movie, autoPlay?: boolean, season?: number, episode?: number) => void;
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

  const openPreview = useCallback((item: Movie, autoPlayFlag: boolean = false, season?: number, episode?: number) => {
    setActiveItem(item);
    setAutoPlay(autoPlayFlag);
    setIsPlaying(autoPlayFlag);
    if (season !== undefined) setInitialSeason(season);
    else setInitialSeason(1);
    if (episode !== undefined) setInitialEpisode(episode);
    else setInitialEpisode(1);
    setIsOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
    setIsPlaying(false);
    setAutoPlay(false);
    setActiveItem(null);
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
