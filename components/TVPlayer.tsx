"use client";
import { useState, useCallback, useEffect } from "react";
import ServerSwitcher from "./ServerSwitcher";
import EpisodeSelector from "./EpisodeSelector";
import { Season, Episode, getSeasonEpisodes } from "@/lib/tmdb";
import { useAnimeTheme } from "@/context/AnimeThemeContext";

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
  const { isAnimeTheme } = useAnimeTheme();
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [episodesMap, setEpisodesMap] = useState<Record<number, Episode[]>>(initialEpisodesMap);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [autoNextEnabled, setAutoNextEnabled] = useState(true);
  const [autoNextToast, setAutoNextToast] = useState<string | null>(null);

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

  // True auto-next listener via postMessage from embed video player (VidLink, PlayerJS, etc.)
  useEffect(() => {
    if (!autoNextEnabled) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        let payload = event.data;
        if (typeof payload === "string") {
          try {
            payload = JSON.parse(payload);
          } catch {}
        }
        if (
          payload?.type === "ended" ||
          payload?.event === "ended" ||
          payload === "ended" ||
          payload?.data?.event === "ended"
        ) {
          setAutoNextToast(`Episode ended. Playing Episode ${currentEpisode + 1}...`);
          const timer = setTimeout(() => {
            handleNextEpisode();
            setAutoNextToast(null);
          }, 2500);
          return () => clearTimeout(timer);
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [autoNextEnabled, currentEpisode, handleNextEpisode]);

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
        runtimeMinutes={currentEpisodeData?.runtime || 24}
      />

      {/* Auto-Next Countdown Toast */}
      {autoNextToast && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xl animate-fade-in backdrop-blur-md ${
            isAnimeTheme
              ? "bg-[#FF6400] text-black shadow-[#FF6400]/30"
              : "bg-red-600/90 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full animate-ping ${isAnimeTheme ? "bg-black" : "bg-white"}`} />
            <span>{autoNextToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setAutoNextToast(null)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              isAnimeTheme ? "bg-black/20 hover:bg-black/35 text-black" : "bg-black/30 hover:bg-black/50 text-white"
            }`}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Helpful fallback hint when a server is buffering or unavailable */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>If a server is buffering or unavailable, switch to <strong>VidSrc PM</strong>, <strong>SuperEmbed Cinema</strong>, or <strong>VidEasy 4K</strong> above.</span>
        </div>
      </div>

      {/* Quick Episode Navigator: Prev, Current Badge, Auto-Next Toggle & Next Episode */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 rounded-xl bg-[#0f1118] border border-white/[0.08] shadow-lg">
        <button
          type="button"
          onClick={handlePrevEpisode}
          disabled={!canPrev}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] cursor-pointer"
          aria-label="Previous Episode"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="hidden xs:inline">Previous Episode</span>
          <span className="xs:hidden">Previous</span>
        </button>

        {/* Center: Current Episode Status & Auto-Next Toggle */}
        <div className="flex items-center gap-2 text-center min-w-0 px-1">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-black tracking-wider shrink-0 ${
              isAnimeTheme
                ? "bg-[#FF6400]/20 text-[#FF6400] border border-[#FF6400]/30"
                : "bg-red-600/20 text-red-400 border border-red-500/30"
            }`}
          >
            S{currentSeason} : E{currentEpisode}
          </span>
          {currentEpisodeData?.name && (
            <span className="hidden sm:inline text-xs font-medium text-zinc-300 max-w-[180px] truncate" title={currentEpisodeData.name}>
              {currentEpisodeData.name}
            </span>
          )}
          <button
            type="button"
            onClick={() => setAutoNextEnabled((v) => !v)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
              autoNextEnabled
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-white/[0.05] text-zinc-500 border border-white/[0.08]"
            }`}
            title={autoNextEnabled ? "Auto-Next Active: Automatically plays next episode" : "Auto-Next Off"}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoNextEnabled ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
            <span>Auto-Next: {autoNextEnabled ? "ON" : "OFF"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleNextEpisode}
          disabled={!canNext}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
            isAnimeTheme
              ? "bg-[#FF6400] hover:bg-[#ff7b1a] text-black font-black shadow-lg shadow-[#FF6400]/30"
              : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
          }`}
          aria-label="Next Episode"
        >
          <span className="hidden xs:inline">Next Episode</span>
          <span className="xs:hidden">Next</span>
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
                aria-label="Loading episode list..."
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
