"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Movie } from "@/lib/tmdb";

interface PreviewModalContextValue {
  isOpen: boolean;
  activeItem: Movie | null;
  autoPlay: boolean;
  isPlaying: boolean;
  openPreview: (item: Movie, autoPlay?: boolean) => void;
  closePreview: () => void;
  setIsPlaying: (playing: boolean) => void;
}

const PreviewModalContext = createContext<PreviewModalContextValue | undefined>(undefined);

export function PreviewModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<Movie | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const openPreview = useCallback((item: Movie, autoPlayFlag: boolean = false) => {
    setActiveItem(item);
    setAutoPlay(autoPlayFlag);
    setIsPlaying(autoPlayFlag);
    setIsOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
    setIsPlaying(false);
    setAutoPlay(false);
    setActiveItem(null);
  }, []);

  return (
    <PreviewModalContext.Provider
      value={{
        isOpen,
        activeItem,
        autoPlay,
        isPlaying,
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
