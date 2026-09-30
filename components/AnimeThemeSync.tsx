"use client";

import { useEffect } from "react";
import { useAnimeTheme } from "@/context/AnimeThemeContext";

interface Props {
  isAnime: boolean;
}

export default function AnimeThemeSync({ isAnime }: Props) {
  const { setIsAnimeOverride } = useAnimeTheme();

  useEffect(() => {
    if (isAnime) {
      setIsAnimeOverride(true);
    }
    return () => {
      setIsAnimeOverride(null);
    };
  }, [isAnime, setIsAnimeOverride]);

  return null;
}
