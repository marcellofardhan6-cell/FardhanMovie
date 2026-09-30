"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface AnimeThemeContextType {
  isAnimeTheme: boolean;
  setIsAnimeOverride: (val: boolean | null) => void;
}

const AnimeThemeContext = createContext<AnimeThemeContextType>({
  isAnimeTheme: false,
  setIsAnimeOverride: () => {},
});

export function AnimeThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAnimeOverride, setIsAnimeOverride] = useState<boolean | null>(null);

  // Automatically reset override when pathname changes
  useEffect(() => {
    setIsAnimeOverride(null);
  }, [pathname]);

  const isAnimeRoute = Boolean(pathname?.startsWith("/anime"));
  const isAnimeTheme = isAnimeOverride !== null ? isAnimeOverride : isAnimeRoute;

  return (
    <AnimeThemeContext.Provider value={{ isAnimeTheme, setIsAnimeOverride }}>
      {children}
    </AnimeThemeContext.Provider>
  );
}

export function useAnimeTheme() {
  return useContext(AnimeThemeContext);
}
