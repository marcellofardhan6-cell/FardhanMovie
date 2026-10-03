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

interface StreamServerOption {
  name: string;
  badge: string;
  badgeColor: string;
  getUrl: (id: string, s: number, e: number, type: "movie" | "tv") => string;
  note: string;
}

const STREAM_SERVERS: StreamServerOption[] = [
  {
    name: "VidLink Pro (CC)",
    badge: "Recommended (Subtitles)",
    badgeColor: "bg-red-600/20 text-red-400 border-red-500/30",
    getUrl: (id, s, e, type) =>
      type === "movie"
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${s}/${e}`,
    note: "Built-in Indonesian & English CC, 1080p stream capture",
  },
  {
    name: "VidSrc PM",
    badge: "Fast Direct",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    getUrl: (id, s, e, type) =>
      type === "movie"
        ? `https://vidsrc.pm/embed/movie/${id}`
        : `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`,
    note: "Official VidSrc mirror, high-speed CDN stream",
  },
  {
    name: "SuperEmbed Cinema",
    badge: "All-Movies",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    getUrl: (id, s, e, type) =>
      type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
    note: "Comprehensive archive with multi-server backup",
  },
  {
    name: "VidEasy 4K",
    badge: "Ultra HD",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    getUrl: (id, s, e, type) =>
      type === "movie"
        ? `https://player.videasy.net/movie/${id}`
        : `https://player.videasy.net/tv/${id}/${s}/${e}`,
    note: "High bitrate 1080p/4K resolution stream",
  },
];

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
  const [activeTab, setActiveTab] = useState<"video" | "subtitles">("video");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Close on Escape key & lock body scroll
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

  const copyToClipboard = useCallback((text: string, key: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  }, []);

  if (!isOpen) return null;

  const id = String(tmdbId);
  const searchQuery =
    type === "tv"
      ? `${title} S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`
      : title;
  const encodedQuery = encodeURIComponent(searchQuery);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Download and Subtitles"
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-[#0c0e15] border border-white/[0.12] shadow-2xl p-5 sm:p-6 text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Poster & Close Button */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08] shrink-0">
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
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-4 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0">
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
            <span>Download Video</span>
          </button>

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
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs text-zinc-300">
          {/* TAB 1: VIDEO DOWNLOAD */}
          {activeTab === "video" && (
            <div className="space-y-4">
              {/* Option 1: Direct Video Stream Links */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Option 1: Direct Stream Sources (Open / Capture)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    Fastest
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-2.5 leading-relaxed">
                  Open the raw streaming player in a dedicated tab to download via browser, or copy the direct stream URL to paste into <strong>1DM</strong>, <strong>IDM</strong>, or <strong>FetchV</strong>:
                </p>

                <div className="space-y-2">
                  {STREAM_SERVERS.map((server, idx) => {
                    const streamUrl = server.getUrl(id, season, episode, type);
                    const isCopied = copiedKey === `server-${idx}`;

                    return (
                      <div
                        key={server.name}
                        className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{server.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${server.badgeColor}`}>
                              {server.badge}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-400 mb-2.5">{server.note}</p>

                        <div className="flex items-center gap-2">
                          <a
                            href={streamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            <span>Open Stream Player</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(streamUrl, `server-${idx}`)}
                            className="py-1.5 px-3 rounded-lg text-[11px] font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Copy stream link for 1DM or IDM"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                            <span>{isCopied ? "Copied!" : "Copy URL"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Option 2: High-Speed Direct Cloud & Portals */}
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                  Option 2: High-Speed Direct Cloud &amp; Media Downloads
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Pahe.ink (Direct Google Drive & Mega for SE Asia / Indonesia) */}
                  <a
                    href={`https://pahe.ink/?s=${encodedQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs group-hover:text-red-400 transition-colors">
                          Pahe.ink (Direct)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          GDrive / Mega
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        720p/1080p direct cloud rips with built-in Indonesian subtitles
                      </p>
                    </div>
                  </a>

                  {/* Google Drive / Cloud Direct Search */}
                  <a
                    href={`https://www.google.com/search?q=${encodedQuery}+"drive.google.com"+OR+"mediafire.com"+download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs group-hover:text-red-400 transition-colors">
                          Cloud Drive Search
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          Google Drive
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Search open Google Drive &amp; Mediafire direct video files
                      </p>
                    </div>
                  </a>

                  {/* TorrentGalaxy (Unblocked Torrents for Movies & TV) */}
                  <a
                    href={`https://torrentgalaxy.to/torrents.php?search=${encodedQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs group-hover:text-red-400 transition-colors">
                          TorrentGalaxy
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          1080p/4K
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        High-speed torrent &amp; magnet download for Movies and Series
                      </p>
                    </div>
                  </a>

                  {/* YTS 1080p */}
                  <a
                    href={`https://yts.mx/browse-movies/${encodedQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs group-hover:text-red-400 transition-colors">
                          YTS 1080p / 720p
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          Compact
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Small file size high-quality MP4 encodes (Movies)
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Instructions box */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed">
                <strong className="text-zinc-200">How to download smoothly:</strong>
                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                  <li><strong>Mobile / Android:</strong> Click <em>&quot;Copy URL&quot;</em> on VidLink Pro, open <strong>1DM</strong> or <strong>ADM</strong> app, and paste the URL to start downloading directly.</li>
                  <li><strong>Desktop:</strong> Click <em>&quot;Open Stream Player&quot;</em>, or use browser download extensions like <strong>FetchV</strong> or <strong>Video DownloadHelper</strong>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: SUBTITLES (.SRT) */}
          {activeTab === "subtitles" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                <strong className="text-emerald-200">Tip: </strong>
                Server 1 (<strong>VidLink Pro</strong>) already has built-in Indonesian &amp; English subtitles directly in the video player (click CC icon). If you are downloading external videos, download .SRT files below:
              </div>

              <div className="space-y-2">
                {/* Google Direct Indonesian Subtitle Search */}
                <a
                  href={`https://www.google.com/search?q=${encodedQuery}+subtitle+indonesia+srt+download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 transition-all group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                        Direct Indonesian Subtitle (.SRT) Search
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                        Top Result
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Fastest search for Indonesian .srt file downloads across all repositories
                    </p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors shrink-0">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>

                {/* SubDL */}
                <a
                  href={`https://subdl.com/search/${encodedQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-red-500/40 transition-all group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                        SubDL Database
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ID &amp; EN
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Verified synchronization with official releases
                    </p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors shrink-0">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>

                {/* OpenSubtitles */}
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors shrink-0">
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
                      Fast subtitle downloads with release matching
                    </p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors shrink-0">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-400">
                <span className="font-semibold text-zinc-200">How to use subtitles: </span>
                Download the .srt file, then drag and drop it onto VLC Media Player, PotPlayer, or MX Player while playing your downloaded video file.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
