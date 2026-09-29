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
  season?: number;
  episode?: number;
}

function buildServerUrl(server: Server, props: Props): string {
  const { tmdbId, type, season = 1, episode = 1 } = props;
  const id = String(tmdbId);

  switch (server.key) {
    case "vidfast":
      return type === "movie"
        ? `https://vidfast.pro/movie/${id}`
        : `https://vidfast.pro/tv/${id}/${season}/${episode}`;
    case "videasy":
      return type === "movie"
        ? `https://player.videasy.net/movie/${id}`
        : `https://player.videasy.net/tv/${id}/${season}/${episode}`;
    case "adrock":
      return type === "movie"
        ? `https://adrock.to/embed/movie/${id}`
        : `https://adrock.to/embed/tv/${id}/${season}/${episode}`;
    case "vidsrc":
      return type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
    case "vidlink":
      return type === "movie"
        ? `https://vidlink.pro/movie/${id}?primaryColor=e50914`
        : `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=e50914`;
    case "vidbolt":
      return type === "movie"
        ? `https://vidbolt.org/embed/movie/${id}`
        : `https://vidbolt.org/embed/tv/${id}/${season}/${episode}`;
    case "vidnest":
      return type === "movie"
        ? `https://vidnest.net/embed/movie/${id}`
        : `https://vidnest.net/embed/tv/${id}/${season}/${episode}`;
    case "vidzee":
      return type === "movie"
        ? `https://vidzee.org/embed/movie/${id}`
        : `https://vidzee.org/embed/tv/${id}/${season}/${episode}`;
    default:
      return `https://player.videasy.net/movie/${id}`;
  }
}

const SERVERS: Server[] = [
  { id: 1, name: "VidFast", key: "vidfast", badge: "4K" },
  { id: 2, name: "VidEasy", key: "videasy", badge: "4K" },
  { id: 3, name: "AdRock", key: "adrock" },
  { id: 4, name: "VidSrc", key: "vidsrc" },
  { id: 5, name: "VidLink", key: "vidlink" },
  { id: 6, name: "VidBolt", key: "vidbolt" },
  { id: 7, name: "VidNest", key: "vidnest" },
  { id: 8, name: "Vidzee", key: "vidzee" },
];

export default function ServerSwitcher(props: Props) {
  // VidEasy (4K) default as shown in reference screenshot
  const [activeServer, setActiveServer] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAllServers, setShowAllServers] = useState(true);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const currentServer = SERVERS[activeServer] || SERVERS[0];
  const src = buildServerUrl(currentServer, props);

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
    if (idx === activeServer) return;
    setActiveServer(idx);
    setIsLoading(true);
    setShowHelp(false);
  }, [activeServer]);

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
        {/* Sleek Servers Header & Pill Bar (Matching media_1790671890532.png) */}
        <div className="p-4 sm:p-5 bg-[#12141c] border-b border-white/[0.08]">
          {/* Header Row: SERVERS + Active Server Name */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                SERVERS
              </span>
              <span className="text-sm font-bold text-white tracking-wide">
                {currentServer.name}
              </span>
            </div>

            {/* Right: Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Player"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen Player"}
            >
              {isFullscreen ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                  <span className="hidden sm:inline text-[11px]">Exit</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                  <span className="hidden sm:inline text-[11px]">Fullscreen</span>
                </>
              )}
            </button>
          </div>

          {/* Servers Pills Row */}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Streaming server options">
            {displayedServers.map((server) => {
              const idx = SERVERS.findIndex((s) => s.id === server.id);
              const isActive = idx === activeServer;
              return (
                <button
                  key={server.id}
                  onClick={() => switchServer(idx)}
                  aria-pressed={isActive}
                  aria-label={`Switch to ${server.name}`}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#22252e] text-white border border-white/20 shadow-md ring-1 ring-white/10"
                      : "bg-[#181a22] text-zinc-300 hover:text-white hover:bg-[#1f222c] border border-white/[0.05]"
                  }`}
                >
                  {/* Status Indicator Dot */}
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />

                  {/* Server Name */}
                  <span>{server.name}</span>

                  {/* 4K Badge */}
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

            {/* FEWER / MORE Expander Toggle */}
            <button
              type="button"
              onClick={() => setShowAllServers((v) => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer ml-auto sm:ml-0"
              aria-label={showAllServers ? "Show fewer servers" : "Show more servers"}
            >
              <span>{showAllServers ? "FEWER" : "MORE"}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {showAllServers ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Video Player Display */}
        <div
          ref={playerContainerRef}
          className="relative w-full aspect-video bg-black [&:fullscreen]:aspect-auto [&:fullscreen]:w-screen [&:fullscreen]:h-screen"
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
                  Connecting to <span className="text-red-400 font-semibold">{currentServer.name}</span>...
                </p>
              </div>
              <span className="text-[11px] text-zinc-500">Fast streaming</span>
            </div>
          )}

          {/* Error / Help overlay */}
          {showHelp && (
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
            key={`${src}-${activeServer}`}
            src={src}
            title={`Streaming Player - ${currentServer.name}`}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen *"
            allowFullScreen={true}
            referrerPolicy="no-referrer"
            onLoad={handleLoad}
            onError={handleIframeError}
          />
        </div>
      </div>
    </section>
  );
}
