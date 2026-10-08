"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useWatchHistory } from "@/context/WatchHistoryContext";
import { useAnimeTheme } from "@/context/AnimeThemeContext";
import DownloadModal from "@/components/DownloadModal";

interface Server {
  id: number;
  name: string;
  key: string;
  badge?: string;
}

interface Props {
  tmdbId: number | string;
  type: "movie" | "tv";
  title?: string;
  season?: number;
  episode?: number;
  trailerKey?: string | null;
  videos?: { id?: string; key: string; name: string; type: string; site?: string; official?: boolean }[];
  posterPath?: string | null;
  backdropPath?: string | null;
  runtimeMinutes?: number | null;
}

function buildServerUrl(server: Server, props: Props, isAnimeTheme?: boolean, startAt?: number): string {
  const { tmdbId, type, season = 1, episode = 1 } = props;
  const id = String(tmdbId);
  const primaryColor = isAnimeTheme ? "ff6400" : "e50914";
  const startAtSec = startAt && startAt > 15 ? Math.floor(startAt) : 0;

  switch (server.key) {
    case "vidlink": {
      const startAtParam = startAtSec > 0 ? `&startAt=${startAtSec}` : "";
      return type === "movie"
        ? `https://vidlink.pro/movie/${id}?primaryColor=${primaryColor}${startAtParam}`
        : `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=${primaryColor}${startAtParam}`;
    }
    case "superembed":
    case "multiembed":
      return type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
    case "vsembed":
    case "vidsrcto":
      return type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
    case "autoembed":
      return type === "movie"
        ? `https://autoembed.co/movie/tmdb/${id}`
        : `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`;
    case "vidsrcpm":
      return type === "movie"
        ? `https://vidsrc.pm/embed/movie/${id}`
        : `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`;
    case "smashy":
      return type === "movie"
        ? `https://embed.smashystream.com/playere.php?tmdb=${id}`
        : `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`;
    case "vidsrcvip":
    case "vidsrcme":
      return type === "movie"
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
    case "twoembed":
      return type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    case "vidsrcdev":
      return type === "movie"
        ? `https://vidsrc.dev/embed/movie/${id}`
        : `https://vidsrc.dev/embed/tv/${id}/${season}/${episode}`;
    case "vidsrcwiki":
      return type === "movie"
        ? `https://vidsrc.wiki/embed/movie/${id}`
        : `https://vidsrc.wiki/embed/tv/${id}/${season}/${episode}`;
    default:
      return type === "movie"
        ? `https://vidlink.pro/movie/${id}?primaryColor=${primaryColor}`
        : `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=${primaryColor}`;
  }
}

const SERVERS: Server[] = [
  { id: 1, name: "AutoEmbed Prime", key: "autoembed", badge: "Anti-Lag" },
  { id: 2, name: "VidLink Pro (CC)", key: "vidlink", badge: "Sub Indo" },
  { id: 3, name: "VidSrc TO (HD)", key: "vsembed", badge: "Fast HD" },
  { id: 4, name: "MultiEmbed Cinema", key: "superembed", badge: "Multi-Source" },
  { id: 5, name: "VidSrc ME (Mirror)", key: "vidsrcvip", badge: "Stabil" },
  { id: 6, name: "VidSrc PM (Vidflix)", key: "vidsrcpm", badge: "Player" },
  { id: 7, name: "SmashyStream", key: "smashy", badge: "VIP" },
  { id: 8, name: "2Embed Mirror", key: "twoembed" },
  { id: 9, name: "VidSrc Dev", key: "vidsrcdev", badge: "Dev" },
  { id: 10, name: "VidSrc Wiki", key: "vidsrcwiki", badge: "Backup" },
];

export default function ServerSwitcher(props: Props) {
  const {
    trailerKey,
    title,
    tmdbId,
    type,
    season = 1,
    episode = 1,
    posterPath,
    backdropPath,
    runtimeMinutes,
  } = props;
  const { addHistory, updateProgress, getHistoryItem } = useWatchHistory();
  const { isAnimeTheme } = useAnimeTheme();
  const [activeServer, setActiveServer] = useState(0);
  const [isTrailerActive, setIsTrailerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAllServers, setShowAllServers] = useState(true);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [resumeToast, setResumeToast] = useState<string | null>(null);
  const [startAtSec, setStartAtSec] = useState<number>(0);
  const currentTimeRef = useRef<number>(0);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Total duration in seconds
  const totalDurationSec =
    runtimeMinutes && runtimeMinutes > 0
      ? runtimeMinutes * 60
      : type === "movie"
      ? 7200
      : 2700;

  // Check initial resume point (URL query `startAt` or localStorage history)
  useEffect(() => {
    if (!tmdbId) return;
    let initialTime = 0;
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("startAt");
      if (q && !isNaN(Number(q)) && Number(q) > 15) {
        initialTime = Number(q);
      }
    }
    if (initialTime === 0) {
      const saved = getHistoryItem(Number(tmdbId), type, season, episode);
      if (saved?.currentTime && saved.currentTime > 15) {
        initialTime = saved.currentTime;
      }
    }

    if (initialTime > 15) {
      setStartAtSec(initialTime);
      currentTimeRef.current = initialTime;
      const mins = Math.floor(initialTime / 60);
      setResumeToast(`Melanjutkan tontonan dari menit ${mins}...`);
      const toastTimer = setTimeout(() => setResumeToast(null), 4500);
      return () => clearTimeout(toastTimer);
    }
  }, [tmdbId, type, season, episode, getHistoryItem]);

  // Initial history entry
  useEffect(() => {
    if (tmdbId && title) {
      addHistory({
        id: Number(tmdbId),
        type,
        title,
        season: type === "tv" ? season : undefined,
        episode: type === "tv" ? episode : undefined,
        poster_path: posterPath,
        backdrop_path: backdropPath,
        duration: totalDurationSec,
      });
    }
  }, [tmdbId, type, title, season, episode, posterPath, backdropPath, totalDurationSec, addHistory]);

  // Real-time playback message listener (VidLink PLAYER_EVENT & standard embeds)
  useEffect(() => {
    if (!tmdbId || !title) return;

    let lastProgressSave = 0;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (!data) return;

        // VidLink PLAYER_EVENT
        if (data.type === "PLAYER_EVENT" && data.data) {
          const { currentTime, duration } = data.data;
          if (typeof currentTime === "number" && currentTime > 0) {
            currentTimeRef.current = currentTime;
            const now = Date.now();
            if (now - lastProgressSave >= 8000) {
              lastProgressSave = now;
              const dur = typeof duration === "number" && duration > 0 ? duration : totalDurationSec;
              updateProgress(Number(tmdbId), type, currentTime, dur, {
                title,
                poster_path: posterPath,
                backdrop_path: backdropPath,
                season: type === "tv" ? season : undefined,
                episode: type === "tv" ? episode : undefined,
              });
            }
          }
        }

        // Generic timeupdate event
        if (data.event === "timeupdate" || data.type === "timeupdate") {
          const time = Number(data.currentTime ?? data.time ?? data.data?.currentTime);
          const dur = Number(data.duration ?? data.data?.duration ?? totalDurationSec);
          if (!isNaN(time) && time > 0) {
            currentTimeRef.current = time;
            const now = Date.now();
            if (now - lastProgressSave >= 8000) {
              lastProgressSave = now;
              updateProgress(Number(tmdbId), type, time, dur, {
                title,
                poster_path: posterPath,
                backdrop_path: backdropPath,
                season: type === "tv" ? season : undefined,
                episode: type === "tv" ? episode : undefined,
              });
            }
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [tmdbId, type, title, season, episode, posterPath, backdropPath, totalDurationSec, updateProgress]);

  // Active watching session timer (ticks every 15s as fallback while tab is active)
  useEffect(() => {
    if (!tmdbId || !title || isTrailerActive || isLoading) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      currentTimeRef.current += 15;
      if (currentTimeRef.current > totalDurationSec) {
        currentTimeRef.current = totalDurationSec;
      }

      updateProgress(Number(tmdbId), type, currentTimeRef.current, totalDurationSec, {
        title,
        poster_path: posterPath,
        backdrop_path: backdropPath,
        season: type === "tv" ? season : undefined,
        episode: type === "tv" ? episode : undefined,
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [tmdbId, type, title, season, episode, posterPath, backdropPath, isTrailerActive, isLoading, totalDurationSec, updateProgress]);

  const currentServer = SERVERS[activeServer] || SERVERS[0];
  const trailerEmbedUrl = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`
    : null;

  const src = isTrailerActive && trailerEmbedUrl
    ? trailerEmbedUrl
    : buildServerUrl(currentServer, props, isAnimeTheme, startAtSec);

  // Auto-dismiss loading after 2.5s so iframe controls are never blocked
  useEffect(() => {
    setIsLoading(true);
    setShowHelp(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [src]);

  // Sync fullscreen state with document
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = playerContainerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  }, []);

  const switchServer = useCallback((idx: number) => {
    if (idx === activeServer && !isTrailerActive) return;
    setIsTrailerActive(false);
    setActiveServer(idx);
    setIsLoading(true);
    setShowHelp(false);
  }, [activeServer, isTrailerActive]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setShowHelp(true);
  }, []);

  const displayedServers = showAllServers ? SERVERS : SERVERS.slice(0, 5);

  return (
    <section aria-label="Video player" className="relative w-full">
      {/* Ambient Cinema Theater Glow behind the player */}
      <div
        className={`absolute -inset-3 rounded-3xl blur-2xl opacity-50 pointer-events-none transition-all duration-500 ${
          isAnimeTheme
            ? "bg-gradient-to-r from-[#FF6400]/25 via-[#FF8C00]/15 to-[#FF4500]/20"
            : "bg-gradient-to-r from-red-600/10 via-red-500/5 to-red-700/10"
        }`}
      />

      {/* Main Player Container */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0c0e15] shadow-2xl">
        {/* Sleek Servers Header & Pill Bar */}
        <div className="p-3.5 sm:p-5 bg-[#12141c] border-b border-white/[0.08]">
          {/* Header Row: SERVERS + Active Server Name */}
          <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                {isTrailerActive ? "TRAILER" : "SERVERS"}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[170px] sm:max-w-none">
                {isTrailerActive ? "Official Trailer (YouTube 4K)" : currentServer.name}
              </span>
            </div>

            {/* Right: Fullscreen Toggle and Direct YouTube link */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isTrailerActive && trailerKey && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold text-red-400 hover:text-white bg-red-600/10 hover:bg-red-600 border border-red-500/20 transition-all cursor-pointer"
                  title="Open on YouTube"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 2c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 2c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
                  </svg>
                  <span className="hidden sm:inline text-[11px]">Open YouTube</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setDownloadOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] transition-colors cursor-pointer"
                title="Download & Subtitles"
                aria-label="Download & Subtitles"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="text-[11px] font-bold">Download</span>
              </button>

              {title && (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    (type === "tv"
                      ? `${title} S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`
                      : title
                    )
                      .replace(/[:\/\\#?&]/g, " ")
                      .replace(/\s+/g, " ")
                      .trim() + " subtitle indonesia srt download"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-white bg-red-600/15 hover:bg-red-600 border border-red-500/30 transition-all cursor-pointer"
                  title="Unduh Subtitle Indonesia (.SRT) Langsung"
                  aria-label="Unduh Subtitle Indonesia Langsung"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect width="20" height="15" x="2" y="4.5" rx="2" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                    <line x1="7" y1="15" x2="13" y2="15" />
                  </svg>
                  <span className="text-[11px] font-bold">Sub Indo</span>
                </a>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Player"}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen Player"}
              >
                {isFullscreen ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                    <span className="text-[11px] font-bold">Exit</span>
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                    <span className="text-[11px] font-bold">Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Servers Pills Row: Horizontal Swipeable on Mobile, Wrapped on Desktop */}
          <div
            className="flex items-center gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-2 sm:pb-0 scroll-snap-x scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0"
            role="group"
            aria-label="Streaming server selection"
          >
            {/* Optional Trailer Button */}
            {trailerEmbedUrl && (
              <button
                type="button"
                onClick={() => {
                  setIsTrailerActive(true);
                  setIsLoading(true);
                  setShowHelp(false);
                }}
                aria-pressed={isTrailerActive}
                aria-label="Play Trailer"
                className={`shrink-0 scroll-snap-item flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isTrailerActive
                    ? "bg-amber-500 text-black shadow-[0_0_18px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/50"
                    : "bg-[#181a22] text-amber-300 hover:text-white hover:bg-[#20232e] border border-amber-500/30"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
                <span>Trailer</span>
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                  isTrailerActive ? "bg-black/30 text-black" : "bg-amber-500/20 text-amber-300"
                }`}>
                  4K
                </span>
                {isTrailerActive && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-black ml-0.5 shrink-0"
                    aria-hidden
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            )}

            {/* Streaming Servers */}
            {displayedServers.map((server) => {
              const idx = SERVERS.findIndex((s) => s.id === server.id);
              const isActive = !isTrailerActive && idx === activeServer;
              return (
                <button
                  key={server.id}
                  onClick={() => switchServer(idx)}
                  aria-pressed={isActive}
                  aria-label={`Switch to ${server.name}`}
                  className={`shrink-0 scroll-snap-item flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#22252e] text-white border border-white/20 shadow-md ring-1 ring-white/10"
                      : "bg-[#181a22] text-zinc-300 hover:text-white hover:bg-[#1f222c] border border-white/[0.05]"
                  }`}
                >
                  {/* Status Indicator Dot */}
                  <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />

                  {/* Server Name */}
                  <span className="whitespace-nowrap">{server.name}</span>

                  {/* Badge */}
                  {server.badge && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#3b2354]/60 text-purple-300 border border-purple-400/25">
                      {server.badge}
                    </span>
                  )}

                  {/* Active Checkmark */}
                  {isActive && (
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-amber-500 ml-0.5 shrink-0"
                      aria-hidden
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}

            {/* Desktop FEWER / MORE Expander Toggle */}
            <button
              type="button"
              onClick={() => setShowAllServers((v) => !v)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer ml-auto sm:ml-0 shrink-0"
              aria-label={showAllServers ? "Show fewer servers" : "Show more servers"}
            >
              <span>{showAllServers ? "FEWER" : "MORE"}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {showAllServers ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Video Player Display: Responsive height so subtitle popups have room on mobile */}
        <div
          ref={playerContainerRef}
          className="relative w-full aspect-video min-h-[275px] xs:min-h-[310px] sm:min-h-0 bg-black [&:fullscreen]:aspect-auto [&:fullscreen]:w-screen [&:fullscreen]:h-screen"
          style={{ transform: "translateZ(0)", willChange: "transform" }}
        >
          {/* Resume Playback Notification Pill */}
          {resumeToast && (
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/85 border border-white/20 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-fade-in pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>{resumeToast}</span>
            </div>
          )}

          {/* Floating Exit Fullscreen Button when in fullscreen mode */}
          {isFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold border border-white/20 shadow-2xl backdrop-blur-md cursor-pointer transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
              <span>Exit Fullscreen</span>
            </button>
          )}

          {/* Subtle non-blocking Loading Indicator */}
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-black/75 backdrop-blur-sm pointer-events-none">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3.5 h-3.5 border-2 border-transparent border-t-red-600 rounded-full animate-spin"
                  role="status"
                  aria-label="Loading video..."
                />
                <p className="text-xs font-medium text-zinc-300">
                  Connecting to <span className="text-red-400 font-semibold">{isTrailerActive ? "Official Trailer" : currentServer.name}</span>...
                </p>
              </div>
              <span className="text-[11px] text-zinc-500">Fast streaming</span>
            </div>
          )}

          {/* Error / Help overlay */}
          {showHelp && !isTrailerActive && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/95 backdrop-blur-md">
              <div className="text-center px-6 max-w-md">
                <div className="w-14 h-14 rounded-full bg-red-600/15 border border-red-600/30 flex items-center justify-center mx-auto mb-3 text-red-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-white mb-2">
                  Server Busy or Unavailable
                </h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  <span className="text-zinc-200 font-semibold">{currentServer.name}</span> cannot be reached at this moment. Please switch to another server above.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SERVERS.filter((_, idx) => idx !== activeServer).slice(0, 4).map((server) => {
                    const targetIdx = SERVERS.findIndex((s) => s.id === server.id);
                    return (
                      <button
                        key={server.id}
                        onClick={() => switchServer(targetIdx)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/[0.08] hover:bg-red-600 text-zinc-200 hover:text-white border border-white/[0.1] transition-all cursor-pointer"
                      >
                        Try {server.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* High compatibility wildcard fullscreen iframe */}
          <iframe
            key={`${src}-${isTrailerActive ? "trailer" : activeServer}`}
            src={src}
            title={isTrailerActive ? "Official Trailer" : `Streaming Player - ${currentServer.name}`}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen *"
            allowFullScreen={true}
            loading="eager"
            referrerPolicy="origin"
            onLoad={handleLoad}
            onError={handleIframeError}
          />
        </div>

        {/* Mobile Touch Area / Scroll Gutter (Prevents getting trapped by iframe touches) */}
        <div className="sm:hidden flex items-center justify-between px-3.5 py-2 bg-[#0e1017] border-t border-white/[0.05] text-[11px] text-zinc-400 select-none">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            Scroll down for info & synopsis
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDownloadOpen(true)}
              className="flex items-center gap-1 text-zinc-300 hover:text-white font-semibold cursor-pointer"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center gap-1 text-zinc-300 hover:text-white font-semibold cursor-pointer"
            >
              <span>Play Fullscreen</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <DownloadModal
        isOpen={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        tmdbId={tmdbId}
        type={type}
        title={title ?? "Video"}
        season={season}
        episode={episode}
        posterPath={posterPath}
      />
    </section>
  );
}
