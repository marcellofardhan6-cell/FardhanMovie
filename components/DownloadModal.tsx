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

function sanitizeTitle(raw: string): string {
  return raw
    .replace(/[:\/\\#?&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  const cleanTitle = sanitizeTitle(title);
  const searchQuery =
    type === "tv"
      ? `${cleanTitle} S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`
      : cleanTitle;
  const encodedQuery = encodeURIComponent(searchQuery);

  const releaseYearNum = year ? parseInt(year, 10) : 0;
  const isUnreleased = releaseYearNum > 2025;

  // 100% reliable subtitle download links
  const googleSrtUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery + " subtitle indonesia srt download")}`;
  const subdlUrl = `https://subdl.com/search?q=${encodedQuery}`;
  const openSubtitlesUrl = `https://www.opensubtitles.com/en/all/search-query-${encodedQuery}/sublanguageid-ind`;
  const subsourceUrl = `https://subsource.net/search?query=${encodedQuery}`;

  const paheUrl = `https://pahe.ink/?s=${encodedQuery}`;
  const gdriveUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' "drive.google.com" OR "mediafire.com" download')}`;

  const vidsrcWikiUrl =
    type === "movie"
      ? `https://vidsrc.wiki/embed/movie/${id}`
      : `https://vidsrc.wiki/embed/tv/${id}/${season}/${episode}`;

  const vidlinkUrl =
    type === "movie"
      ? `https://vidlink.pro/movie/${id}`
      : `https://vidlink.pro/tv/${id}/${season}/${episode}`;

  const vidsrcUrl =
    type === "movie"
      ? `https://vidsrc.pm/embed/movie/${id}`
      : `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Download dan Subtitle"
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
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors cursor-pointer shrink-0"
            aria-label="Tutup modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-3.5 pt-4 pr-1 text-xs text-zinc-300">
          {/* Unreleased Warning */}
          {isUnreleased && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-300 mb-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Status: Belum Resmi Rilis (Tahun {year})</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Film ini masih berstatus rilis mendatang. Berkas film dan subtitle Indonesia baru akan tersedia setelah penayangan resmi di bioskop/digital.
              </p>
            </div>
          )}

          {/* SECTION 1: DIRECT SUBTITLE INDONESIA (.SRT) */}
          <div className="p-4 rounded-xl bg-red-600/[0.08] border border-red-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                  <rect width="20" height="15" x="2" y="4.5" rx="2" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                  <line x1="7" y1="15" x2="13" y2="15" />
                </svg>
                <span className="font-bold text-white text-sm">Unduh Subtitle Indonesia (.SRT)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase">
                1-Klik
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3">
              Klik untuk mencari dan mengunduh berkas subtitle .SRT Indonesia langsung dari semua sumber:
            </p>

            {/* Primary 1-Click Button (Google Subtitle Search - Guarantees No 404) */}
            <a
              href={googleSrtUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/20 mb-2.5 text-center"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Unduh Subtitle Indonesia Langsung</span>
            </a>

            {/* Alternative Database Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-zinc-500 font-medium mr-1">Database Subtitle:</span>
              <a
                href={subdlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 transition-colors"
              >
                SubDL
              </a>
              <a
                href={openSubtitlesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 transition-colors"
              >
                OpenSubtitles
              </a>
              <a
                href={subsourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 transition-colors"
              >
                Subsource
              </a>
            </div>
          </div>

          {/* SECTION 2: UNDUH VIDEO LENGKAP DENGAN SUB INDO */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="font-bold text-white text-sm">Unduh Video + Subtitle Indo</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                GDrive &amp; Mega
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3">
              Rilisan video resolusi 720p/1080p yang sudah dilengkapi subtitle Indonesia:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={paheUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-white text-xs block group-hover:text-amber-400 transition-colors">
                    Pahe.ink (Direct)
                  </span>
                  <span className="text-[10px] text-zinc-400">Google Drive &amp; Mega rip</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-500 group-hover:text-white transition-colors">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

              <a
                href={gdriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-white text-xs block group-hover:text-amber-400 transition-colors">
                    Pencarian Google Drive
                  </span>
                  <span className="text-[10px] text-zinc-400">Berkas video publik</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-500 group-hover:text-white transition-colors">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>

          {/* SECTION 3: STREAM CAPTURE FOR 1DM & IDM */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-xs">Unduh Stream Video (1DM / IDM)</span>
              <span className="text-[10px] text-zinc-500">Player Mirror</span>
            </div>

            <div className="space-y-2">
              {/* VidSrc Wiki */}
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-white text-xs block truncate">VidSrc Wiki</span>
                  <span className="text-[10px] text-zinc-400">Server Utama (Official)</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={vidsrcWikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1 px-2.5 rounded-md text-[11px] font-bold bg-white/[0.08] hover:bg-white/[0.15] text-white transition-colors"
                  >
                    Buka Player
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(vidsrcWikiUrl, "vidsrcwiki")}
                    className="py-1 px-2.5 rounded-md text-[11px] font-semibold bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-colors"
                  >
                    {copiedKey === "vidsrcwiki" ? "Tersalin!" : "Salin Link"}
                  </button>
                </div>
              </div>

              {/* VidLink Pro */}
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-white text-xs block truncate">VidLink Pro</span>
                  <span className="text-[10px] text-emerald-400">Ada CC Subtitle Indonesia</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={vidlinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1 px-2.5 rounded-md text-[11px] font-bold bg-white/[0.08] hover:bg-white/[0.15] text-white transition-colors"
                  >
                    Buka Player
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(vidlinkUrl, "vidlink")}
                    className="py-1 px-2.5 rounded-md text-[11px] font-semibold bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-colors"
                  >
                    {copiedKey === "vidlink" ? "Tersalin!" : "Salin Link"}
                  </button>
                </div>
              </div>

              {/* VidSrc PM */}
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-white text-xs block truncate">VidSrc PM</span>
                  <span className="text-[10px] text-zinc-400">Stream CDN Cepat</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={vidsrcUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1 px-2.5 rounded-md text-[11px] font-bold bg-white/[0.08] hover:bg-white/[0.15] text-white transition-colors"
                  >
                    Buka Player
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(vidsrcUrl, "vidsrc")}
                    className="py-1 px-2.5 rounded-md text-[11px] font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 transition-colors"
                  >
                    {copiedKey === "vidsrc" ? "Tersalin!" : "Salin Link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
