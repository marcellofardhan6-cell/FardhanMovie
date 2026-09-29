"use client";
import { useState, useCallback } from "react";

interface Server {
  id: number;
  name: string;
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

  switch (server.id) {
    case 1: // VidFast
      return type === "movie"
        ? `https://vidfast.pro/movie/${id}?autoPlay=true`
        : `https://vidfast.pro/tv/${id}/${season}/${episode}?autoPlay=true`;
    case 2: // VidLink
      return type === "movie"
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${season}/${episode}`;
    case 3: // vidsrc.pm
      return type === "movie"
        ? `https://vidsrc.pm/embed/movie/${id}`
        : `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`;
    case 4: // vidsrc.to
      return type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
    case 5: // vidsrc.cc
      return type === "movie"
        ? `https://vidsrc.cc/v2/embed/movie/${id}`
        : `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
    case 6: // 2embed.cc
      return type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    case 7: // nontongo.win
      return type === "movie"
        ? `https://www.nontongo.win/embed/movie/${id}`
        : `https://www.nontongo.win/embed/tv/${id}/${season}/${episode}`;
    case 8: // autoembed.co
      return type === "movie"
        ? `https://autoembed.co/movie/tmdb/${id}`
        : `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`;
    case 9: // moviesapi.to
      return type === "movie"
        ? `https://moviesapi.to/movie/${id}`
        : `https://moviesapi.to/tv/${id}-${season}-${episode}`;
    case 10: // smashystream
      return type === "movie"
        ? `https://player.smashystream.com/playere.php?tmdb=${id}`
        : `https://player.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`;
    default:
      return "";
  }
}

const SERVERS: Server[] = [
  { id: 1, name: "VidFast", badge: "Utama" },
  { id: 2, name: "VidLink", badge: "HD" },
  { id: 3, name: "VidSrc.pm" },
  { id: 4, name: "VidSrc.to" },
  { id: 5, name: "VidSrc.cc" },
  { id: 6, name: "2Embed" },
  { id: 7, name: "NontonGo", badge: "Asia/ID" },
  { id: 8, name: "AutoEmbed" },
  { id: 9, name: "MoviesAPI" },
  { id: 10, name: "Smashy" },
];

export default function ServerSwitcher(props: Props) {
  const [activeServer, setActiveServer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const currentServer = SERVERS[activeServer];
  const src = buildServerUrl(currentServer, props);

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

  const handleLoadTimeout = useCallback(() => {
    setIsLoading(false);
    setShowHelp(true);
  }, []);

  return (
    <section aria-label="Video player" className="relative w-full">
      {/* Ambient Cinema Theater Glow behind the player */}
      <div className="absolute -inset-4 bg-gradient-to-r from-red-600/15 via-red-500/8 to-red-700/15 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

      {/* Main Player Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] bg-[#08090e] shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-[#0c0e16] via-[#10131d] to-[#0c0e16] border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-zinc-300">
              Pilih Server:
            </span>
          </div>

          {/* Server Pill List */}
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Pilih server streaming">
            {SERVERS.map((server, idx) => {
              const isActive = idx === activeServer;
              return (
                <button
                  key={server.id}
                  onClick={() => switchServer(idx)}
                  aria-pressed={isActive}
                  aria-label={`Ganti ke ${server.name}`}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.45)]"
                      : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                  }`}
                >
                  <span>{server.name}</span>
                  {server.badge && (
                    <span
                      className={`ml-1 text-[9px] px-1 py-0.2 rounded font-extrabold uppercase ${
                        isActive
                          ? "bg-black/40 text-white"
                          : "bg-red-600/20 text-red-400 border border-red-600/30"
                      }`}
                    >
                      {server.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-zinc-400 hidden xl:block">
            Jika video buffering atau tidak jalan, beralih ke server lain
          </div>
        </div>

        {/* Video Player Display */}
        <div className="relative w-full aspect-video bg-black">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/90 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3.5">
                <div
                  className="w-12 h-12 border-3 border-transparent border-t-red-600 rounded-full animate-spin"
                  role="status"
                  aria-label="Memuat video..."
                />
                <p className="text-sm font-semibold text-zinc-300">
                  Menghubungkan ke <span className="text-red-500">{currentServer.name}</span>...
                </p>
                <button
                  onClick={handleLoadTimeout}
                  className="text-xs text-zinc-400 hover:text-red-400 underline cursor-pointer mt-1"
                >
                  Terlalu lama? Coba server lain
                </button>
              </div>
            </div>
          )}

          {/* Error / Help overlay */}
          {showHelp && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/95 backdrop-blur-md">
              <div className="text-center px-6 max-w-md">
                <div className="w-14 h-14 rounded-full bg-red-600/15 border border-red-600/30 flex items-center justify-center mx-auto mb-3 text-red-500 text-2xl">
                  📡
                </div>
                <p
                  className="text-lg font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {currentServer.name} Sedang Sibuk
                </p>
                <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                  Server gratisan kadang mengalami antrean streaming. Silakan beralih ke server berikutnya seperti VidFast, VidLink, atau NontonGo.
                </p>
                <div className="flex gap-2.5 justify-center">
                  <button
                    onClick={() => switchServer((activeServer + 1) % SERVERS.length)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(229,9,20,0.5)] cursor-pointer transition-colors"
                  >
                    Ganti ke Server Berikutnya
                  </button>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="px-4 py-2.5 rounded-full text-xs font-semibold text-zinc-300 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Streaming Iframe */}
          <iframe
            key={src}
            src={src}
            title={`Video player - ${currentServer.name}`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="no-referrer"
            onLoad={handleLoad}
            onError={handleIframeError}
            style={{ border: "none" }}
          />
        </div>
      </div>
    </section>
  );
}
