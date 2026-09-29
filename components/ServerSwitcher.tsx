"use client";
import { useState, useCallback } from "react";

interface Server {
  id: number;
  name: string;
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
    case 1: // VidFast — paling reliable saat ini
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
    case 7: // nontongo.win — fokus konten Asia/Indonesia
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
    case 10: // smashystream (domain baru)
      return type === "movie"
        ? `https://player.smashystream.com/playere.php?tmdb=${id}`
        : `https://player.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`;
    default:
      return "";
  }
}

const SERVERS: Server[] = [
  { id: 1, name: "VidFast" },
  { id: 2, name: "VidLink" },
  { id: 3, name: "VidSrc.pm" },
  { id: 4, name: "VidSrc.to" },
  { id: 5, name: "VidSrc.cc" },
  { id: 6, name: "2Embed" },
  { id: 7, name: "NontonGo" },
  { id: 8, name: "AutoEmbed" },
  { id: 9, name: "MoviesAPI" },
  { id: 10, name: "Smashy" },
];

export default function ServerSwitcher(props: Props) {
  const [activeServer, setActiveServer] = useState(0); // index
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

  // Auto-hide loading kalau provider lama banget nge-load
  const handleLoadTimeout = useCallback(() => {
    setIsLoading(false);
    setShowHelp(true);
  }, []);

  return (
    <section aria-label="Video player" className="w-full">
      {/* Server switcher bar */}
      <div
        className="flex flex-wrap items-center gap-2 p-3 rounded-t-lg"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderBottom: "none" }}
        role="group"
        aria-label="Pilih server streaming"
      >
        <span className="text-xs font-medium mr-1" style={{ color: "var(--text-muted)" }}>Server:</span>
        {SERVERS.map((server, idx) => (
          <button
            key={server.id}
            onClick={() => switchServer(idx)}
            aria-pressed={idx === activeServer}
            aria-label={`Ganti ke ${server.name}`}
            className="px-3 py-1.5 rounded text-xs font-medium transition-all"
            style={{
              background: idx === activeServer ? "var(--accent)" : "var(--surface-2)",
              color: idx === activeServer ? "#0a0a0f" : "var(--text-muted)",
              border: `1px solid ${idx === activeServer ? "var(--accent)" : "var(--border)"}`,
              fontWeight: idx === activeServer ? 600 : 400,
            }}
          >
            {server.name}
          </button>
        ))}
      </div>

      {/* Player */}
      <div
        className="relative w-full rounded-b-lg overflow-hidden"
        style={{ aspectRatio: "16/9", background: "#000", border: "1px solid var(--border)" }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: "#000" }}>
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 border-2 border-transparent rounded-full animate-spin"
                style={{ borderTopColor: "var(--accent)" }}
                role="status"
                aria-label="Memuat video..."
              />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Memuat {currentServer.name}...</p>
              <button
                onClick={handleLoadTimeout}
                className="text-xs underline mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                Lama? Coba server lain
              </button>
            </div>
          </div>
        )}

        {/* Error / help state */}
        {showHelp && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: "#000" }}>
            <div className="text-center px-6 max-w-md">
              <p className="text-4xl mb-3" aria-hidden>📡</p>
              <p className="font-semibold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-fraunces)" }}>
                {currentServer.name} tidak merespons
              </p>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                Server gratisan sering down. Coba server lain di atas — VidFast &amp; VidLink paling stabil.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => switchServer((activeServer + 1) % SERVERS.length)}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{ background: "var(--accent)", color: "#0a0a0f" }}
                >
                  Coba Server Berikutnya
                </button>
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 rounded text-sm font-medium"
                  style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Iframe — TANPA sandbox. Hampir semua provider embed gratisan
            mendeteksi sandbox dan menolak play ("Playback blocked").
            referrerPolicy no-referrer tetap meminimalkan tracking. */}
        <iframe
          key={`${src}`}
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
    </section>
  );
}
