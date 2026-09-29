"use client";
import { useState, useCallback, useEffect } from "react";
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
  posterPath?: string | null;
  backdropPath?: string | null;
}

export default function TVPlayer({
  tmdbId,
  seasons,
  initialSeason,
  initialEpisode,
  initialEpisodesMap,
  title,
  trailerKey,
  posterPath,
  backdropPath,
}: Props) {
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [episodesMap, setEpisodesMap] = useState<Record<number, Episode[]>>(initialEpisodesMap);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const validSeasons = seasons.filter((s) => s.season_number > 0);
  const currentSeasonObj = validSeasons.find((s) => s.season_number === currentSeason);
  const currentSeasonEpisodes = episodesMap[currentSeason] || [];
  const totalEpisodesInCurrentSeason = currentSeasonEpisodes.length || currentSeasonObj?.episode_count || 0;
  const currentEpisodeData = currentSeasonEpisodes.find((e) => e.episode_number === currentEpisode);

  const currentSeasonIndex = validSeasons.findIndex((s) => s.season_number === currentSeason);
  const canPrev = currentEpisode > 1 || currentSeasonIndex > 0;
  const canNext =
    (totalEpisodesInCurrentSeason > 0 && currentEpisode < totalEpisodesInCurrentSeason) ||
    currentSeasonIndex < validSeasons.length - 1;

  const updateUrl = useCallback((s: number, e: number) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("season", String(s));
    url.searchParams.set("episode", String(e));
    window.history.replaceState(null, "", url.toString());
  }, []);

  const handleSeasonChange = useCallback(
    async (season: number) => {
      setCurrentSeason(season);
      setCurrentEpisode(1);
      updateUrl(season, 1);
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
    [episodesMap, tmdbId, updateUrl]
  );

  const handleEpisodeSelect = useCallback(
    (season: number, episode: number) => {
      setCurrentSeason(season);
      setCurrentEpisode(episode);
      updateUrl(season, episode);
      // Smooth scroll back to player
      document.getElementById("player")?.scrollIntoView({ behavior: "smooth" });
    },
    [updateUrl]
  );

  const handlePrevEpisode = useCallback(() => {
    if (currentEpisode > 1) {
      handleEpisodeSelect(currentSeason, currentEpisode - 1);
    } else if (currentSeasonIndex > 0) {
      const prevSeason = validSeasons[currentSeasonIndex - 1];
      const prevEps = episodesMap[prevSeason.season_number];
      const targetEp = prevEps?.length || prevSeason.episode_count || 1;
      handleSeasonChange(prevSeason.season_number).then(() => {
        handleEpisodeSelect(prevSeason.season_number, targetEp);
      });
    }
  }, [currentEpisode, currentSeason, currentSeasonIndex, validSeasons, episodesMap, handleEpisodeSelect, handleSeasonChange]);

  const handleNextEpisode = useCallback(() => {
    if (totalEpisodesInCurrentSeason > 0 && currentEpisode < totalEpisodesInCurrentSeason) {
      handleEpisodeSelect(currentSeason, currentEpisode + 1);
    } else if (currentSeasonIndex < validSeasons.length - 1) {
      const nextSeason = validSeasons[currentSeasonIndex + 1];
      handleSeasonChange(nextSeason.season_number);
      handleEpisodeSelect(nextSeason.season_number, 1);
    }
  }, [currentEpisode, totalEpisodesInCurrentSeason, currentSeasonIndex, validSeasons, handleEpisodeSelect, handleSeasonChange]);

  return (
    <div className="space-y-4">
      {/* Streaming Server Switcher */}
      <ServerSwitcher
        tmdbId={tmdbId}
        type="tv"
        title={title}
        season={currentSeason}
        episode={currentEpisode}
        trailerKey={trailerKey}
        posterPath={posterPath}
        backdropPath={backdropPath}
      />

      {/* Quick Episode Navigator: Prev, Current Badge & Next Episode */}
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4 rounded-xl bg-[#0f1118] border border-white/[0.08] shadow-lg">
        <button
          type="button"
          onClick={handlePrevEpisode}
          disabled={!canPrev}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] cursor-pointer"
          aria-label="Episode Sebelumnya"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="hidden xs:inline">Episode Sebelumnya</span>
          <span className="xs:hidden">Sebelumnya</span>
        </button>

        {/* Active Episode Badge & Name */}
        <div className="flex items-center gap-2 text-center min-w-0 px-1">
          <span className="px-2.5 py-1 rounded-md text-xs font-black tracking-wider bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
            S{currentSeason} : E{currentEpisode}
          </span>
          {currentEpisodeData?.name && (
            <span className="hidden sm:inline text-xs font-medium text-zinc-300 max-w-[220px] truncate" title={currentEpisodeData.name}>
              {currentEpisodeData.name}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleNextEpisode}
          disabled={!canNext}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 cursor-pointer"
          aria-label="Episode Berikutnya"
        >
          <span className="hidden xs:inline">Episode Berikutnya</span>
          <span className="xs:hidden">Berikutnya</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Episodes Grid Selector */}
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
                aria-label="Memuat daftar episode..."
              />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Memuat episode...</p>
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
