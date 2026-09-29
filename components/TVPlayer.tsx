"use client";
import { useState, useCallback } from "react";
import ServerSwitcher from "./ServerSwitcher";
import EpisodeSelector from "./EpisodeSelector";
import { Season, Episode, getSeasonEpisodes } from "@/lib/tmdb";

interface Props {
  tmdbId: number;
  seasons: Season[];
  initialSeason: number;
  initialEpisode: number;
  initialEpisodesMap: Record<number, Episode[]>;
  title?: string;
  trailerKey?: string | null;
}

export default function TVPlayer({
  tmdbId,
  seasons,
  initialSeason,
  initialEpisode,
  initialEpisodesMap,
  title,
  trailerKey,
}: Props) {
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [episodesMap, setEpisodesMap] = useState<Record<number, Episode[]>>(initialEpisodesMap);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const handleSeasonChange = useCallback(
    async (season: number) => {
      setCurrentSeason(season);
      setCurrentEpisode(1);
      if (!episodesMap[season]) {
        setLoadingEpisodes(true);
        try {
          const eps = await getSeasonEpisodes(String(tmdbId), season);
          setEpisodesMap((prev) => ({ ...prev, [season]: eps }));
        } catch {
          setEpisodesMap((prev) => ({ ...prev, [season]: [] }));
        } finally {
          setLoadingEpisodes(false);
        }
      }
    },
    [episodesMap, tmdbId]
  );

  const handleEpisodeSelect = useCallback((season: number, episode: number) => {
    setCurrentSeason(season);
    setCurrentEpisode(episode);
  }, []);

  return (
    <div className="space-y-4">
      <ServerSwitcher
        tmdbId={tmdbId}
        type="tv"
        title={title}
        season={currentSeason}
        episode={currentEpisode}
        trailerKey={trailerKey}
      />

      <div>
        {loadingEpisodes ? (
          <div
            className="flex items-center justify-center py-8 rounded-lg"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 border-2 border-transparent rounded-full animate-spin"
                style={{ borderTopColor: "var(--accent)" }}
                role="status"
                aria-label="Loading episodes..."
              />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading episodes...</p>
            </div>
          </div>
        ) : (
          <EpisodeSelector
            seasons={seasons}
            currentSeason={currentSeason}
            currentEpisode={currentEpisode}
            episodesMap={episodesMap}
            onSelect={handleEpisodeSelect}
            onSeasonChange={handleSeasonChange}
          />
        )}
      </div>
    </div>
  );
}
