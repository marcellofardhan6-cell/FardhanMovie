/**
 * Dedicated high-speed streaming CDN sources (e.g. AbyssPlayer from Ngefilm/LK21)
 * Mapped by TMDB ID.
 */
export const DEDICATED_ABYSS_SOURCES: Record<string, string> = {
  // 402 Rumah Sakit Angker Korea (2026) - Server 2 Ngefilm (AbyssPlayer)
  "1475375": "https://player.abyssplayer.com/cXnpCNkuF",
};

/**
 * Resolves the streaming URL for Server 6 (AbyssPlayer / High-speed Asia CDN)
 */
export function getAbyssServerUrl(
  tmdbId: string | number,
  type: "movie" | "tv",
  season: number = 1,
  episode: number = 1
): string {
  const idStr = String(tmdbId);

  // If a direct AbyssPlayer link is configured, return it directly
  if (DEDICATED_ABYSS_SOURCES[idStr]) {
    return DEDICATED_ABYSS_SOURCES[idStr];
  }

  // Fallback high-speed server for other titles
  return type === "tv"
    ? `https://v2.vidsrc.me/embed/tv/${idStr}/${season}/${episode}`
    : `https://v2.vidsrc.me/embed/movie/${idStr}`;
}
