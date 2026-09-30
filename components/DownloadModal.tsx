"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { img } from "@/lib/tmdb";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number | string;
  type: "movie" | "tv";
  title: string;
  year?: string | null;
  season?: number;
  episode?: number;
  posterPath?: string | null;
}

export default function DownloadModal({
  isOpen,
  onClose,
  tmdbId,
  type,
  title,
  year,
  season = 1,
  episode = 1,
  posterPath,
}: Props) {
  const [activeTab, setActiveTab] = useState<"subtitles" | "video">("subtitles");
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const copyCurrentUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, []);

  if (!isOpen) return null;

  const searchQuery = type === "tv" ? `${title} S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}` : title;
  const encodedQuery = encodeURIComponent(searchQuery);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Download and Subtitles"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#0c0e15] border border-white/[0.12] shadow-2xl p-5 sm:p-6 text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Poster & Close Button */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/10 shadow-md">
              <Image
                src={img(posterPath ?? null, "w185")}
                alt={title}
                fill
                className="object-cover"
                unoptimized={!posterPath}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate" title={title}>
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-bold text-zinc-300 uppercase">
                  {type === "tv" ? `S${season} : E${episode}` : "Movie"}
                </span>
                {year && <span>{year}</span>}
                <span>•</span>
                <span className="text-zinc-500 font-mono text-[11px]">TMDB {tmdbId}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab("subtitles")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "subtitles"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="15" x="2" y="4.5" rx="2" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="7" y1="15" x2="13" y2="15" />
            </svg>
            <span>Subtitles (.SRT)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "video"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Video Download</span>
          </button>
        </div>

        {/* Tab 1: Subtitles Content */}
        {activeTab === "subtitles" && (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-zinc-300">
              Download official Indonesian and English subtitle files directly matched to this title:
            </p>

            <div className="space-y-2">
              {/* SubDL Provider (Matched directly by TMDB ID) */}
              <a
                href={
                  type === "tv"
                    ? `https://subdl.com/s/info/tv/${tmdbId}`
                    : `https://subdl.com/s/info/movie/${tmdbId}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 transition-all group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                      SubDL Database (Verified)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ID &amp; EN
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Direct TMDB matching with Indonesian &amp; English subtitles
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

              {/* OpenSubtitles.org */}
              <a
                href={`https://www.opensubtitles.org/en/search/sublanguageid-ind,eng/moviename-${encodedQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 transition-all group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                      OpenSubtitles
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/10 text-zinc-300">
                      Indonesian &amp; English
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Extensive community subtitle archive in .SRT and .VTT
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

              {/* Subsource */}
              <a
                href={`https://subsource.net/search/${encodedQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 transition-all group cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                    Subsource Search
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Modern fast subtitle repository
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-200">How to use subtitles: </span>
              Download the .srt file, then drag and drop it onto VLC Media Player, MPV, or PotPlayer while playing your downloaded video file.
            </div>
          </div>
        )}

        {/* Tab 2: Video Download Content */}
        {activeTab === "video" && (
          <div className="mt-4 space-y-4">
            {/* Method 1: Stream Capture */}
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white">
                  Method 1: Direct Player Capture (Fastest MP4)
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Play the video on any server above, then capture the stream using an automatic stream downloader:
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-zinc-300 list-disc list-inside">
                <li><strong className="text-white">Android / Mobile:</strong> Open this page in <span className="text-red-400 font-semibold">1DM Browser</span> — it automatically detects the video stream and downloads it directly as MP4.</li>
                <li><strong className="text-white">PC / Browser:</strong> Install the free extension <span className="text-red-400 font-semibold">Video DownloadHelper</span> or <span className="text-red-400 font-semibold">FetchV</span> on Chrome/Firefox to download 1080p stream in one click.</li>
              </ul>

              <button
                type="button"
                onClick={copyCurrentUrl}
                className="mt-3 w-full py-2 rounded-lg text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <span>{copied ? "Link Copied!" : "Copy Page Link for 1DM / Downloader"}</span>
              </button>
            </div>

            {/* Method 2: Torrent / Magnet Portals */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Method 2: High-Speed Torrent &amp; Magnet Portals
              </span>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://yts.mx/browse-movies/${encodedQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 text-xs font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span>YTS 1080p Movies</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                  </svg>
                </a>

                <a
                  href={`https://1337x.to/search/${encodedQuery}/1/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 text-xs font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span>1337x Torrents</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
