"use client";
import { useState, useCallback, useEffect, useRef } from "react";

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
}

function buildServerUrl(server: Server, props: Props): string {
  const { tmdbId, type, season = 1, episode = 1 } = props;
  const id = String(tmdbId);

  switch (server.key) {
    case "vidsrcwiki":
      return type === "movie"
        ? `https://vidsrc.wiki/embed/movie/${id}`
        : `https://vidsrc.wiki/embed/tv/${id}/${season}/${episode}`;
    case "superembed":
      return type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
    case "vidsrcvip":
      return type === "movie"
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
    case "vidlink":
      return type === "movie"
        ? `https://vidlink.pro/movie/${id}?primaryColor=e50914`
        : `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=e50914`;
    case "twoembed":
      return type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    case "vsembed":
      return type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
    case "autoembed":
      return type === "movie"
        ? `https://player.autoembed.cc/embed/movie/${id}`
        : `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`;
    case "videasy":
      return type === "movie"
        ? `https://player.videasy.net/movie/${id}`
        : `https://player.videasy.net/tv/${id}/${season}/${episode}`;
    case "adrock":
      return type === "movie"
        ? `https://adrock.to/embed/movie/${id}`
        : `https://adrock.to/embed/tv/${id}/${season}/${episode}`;
    default:
      return type === "movie"
        ? `https://vidsrc.wiki/embed/movie/${id}`
        : `https://vidsrc.wiki/embed/tv/${id}/${season}/${episode}`;
  }
}

const SERVERS: Server[] = [
  { id: 1, name: "VidSrcWiki", key: "vidsrcwiki", badge: "Primary" },
  { id: 2, name: "SuperEmbed Cinema", key: "superembed", badge: "All-Movies" },
  { id: 3, name: "VidSrc VIP", key: "vidsrcvip", badge: "VIP" },
  { id: 4, name: "VidLink Pro (CC)", key: "vidlink", badge: "4K" },
  { id: 5, name: "2Embed Mirror", key: "twoembed" },
  { id: 6, name: "VSEmbed Alternate", key: "vsembed" },
  { id: 7, name: "AutoEmbed Ultra HD", key: "autoembed", badge: "UHD" },
  { id: 8, name: "VidEasy 4K", key: "videasy", badge: "4K" },
  { id: 9, name: "AdRock Fast", key: "adrock" },
];

export default function ServerSwitcher(props: Props) {
  const { trailerKey, title } = props;
  const [activeServer, setActiveServer] = useState(0);
  const [isTrailerActive, setIsTrailerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAllServers, setShowAllServers] = useState(true);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const currentServer = SERVERS[activeServer] || SERVERS[0];
  const trailerEmbedUrl = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`
    : null;

  const src = isTrailerActive && trailerEmbedUrl
    ? trailerEmbedUrl
    : buildServerUrl(currentServer, props);

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
      <div className="absolute -inset-3 bg-gradient-to-r from-red-600/10 via-red-500/5 to-red-700/10 rounded-3xl blur-2xl opacity-50 pointer-events-none" />

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
                  title="Buka langsung di YouTube"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 2c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 2c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
                  </svg>
                  <span className="hidden sm:inline text-[11px]">Buka YouTube</span>
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
                    <span className="text-[11px] font-bold">Layar Penuh</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Servers Pills Row: Horizontal Swipeable on Mobile, Wrapped on Desktop */}
          <div
            className="flex items-center gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-2 sm:pb-0 scroll-snap-x scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0"
            role="group"
            aria-label="Pilihan server streaming"
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
                aria-label="Putar Trailer"
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
        >
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
                <div className="w-14 h-14 rounded-full bg-red-600/15 border border-red-600/30 flex items-center justify-center mx-auto mb-3 text-red-500 text-2xl">
                  ⚠️
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
            referrerPolicy="no-referrer"
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
            Geser di sini untuk info & sinopsis
          </span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1 text-zinc-300 hover:text-white font-semibold cursor-pointer"
          >
            <span>Putar Fullscreen</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
