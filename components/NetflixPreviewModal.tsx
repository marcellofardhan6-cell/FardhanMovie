"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { usePreviewModal } from "@/context/PreviewModalContext";
import { useFavorites } from "@/context/FavoritesContext";
import { img, displayTitle, displayYear, isTV, Genre, Movie } from "@/lib/tmdb";
import DownloadModal from "@/components/DownloadModal";

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface DetailApiResponse {
  id: number;
  title: string;
  tagline: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  runtime: string | null;
  year: string;
  genres: Genre[];
  overview: string | null;
  isAnime: boolean;
  seasons: { id: number; name: string; season_number: number; episode_count: number }[];
  recommendations: Movie[];
  cast: CastMember[];
}

export default function NetflixPreviewModal() {
  const { isOpen, activeItem, autoPlay, closePreview, openPreview } = usePreviewModal();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [detailData, setDetailData] = useState<DetailApiResponse | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const [activeServer, setActiveServer] = useState<"cinesrc" | "vidsrcwiki">("cinesrc");
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resolvedType = activeItem
    ? activeItem.media_type === "tv" || isTV(activeItem)
      ? "tv"
      : "movie"
    : "movie";

  const fav = activeItem ? isFavorite(activeItem.id) : false;

  // Fetch full details when modal opens
  const fetchDetail = useCallback(async (id: number, type: "movie" | "tv") => {
    try {
      const res = await fetch(`/api/detail?id=${id}&type=${type}`);
      if (!res.ok) return;
      const data: DetailApiResponse = await res.json();
      setDetailData(data);
      if (data.seasons && data.seasons.length > 0) {
        const validSeason = data.seasons.find((s) => s.season_number > 0);
        if (validSeason) setSelectedSeason(validSeason.season_number);
      }
    } catch {}
  }, []);

  // Request browser fullscreen synchronously on user click
  const handleStartPlay = useCallback(
    (seasonNum?: number, episodeNum?: number) => {
      if (seasonNum !== undefined) setSelectedSeason(seasonNum);
      if (episodeNum !== undefined) setSelectedEpisode(episodeNum);
      setIsTheaterOpen(true);

      try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if ((docEl as any).webkitRequestFullscreen) {
          (docEl as any).webkitRequestFullscreen();
        }
      } catch {}
    },
    []
  );

  const handleExitTheater = useCallback(() => {
    setIsTheaterOpen(false);
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch {}
  }, []);

  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if ((docEl as any).webkitRequestFullscreen) {
          (docEl as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch {}
  }, []);

  // Show / hide floating controls on mouse movement in theater mode
  const handleUserActivity = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
  }, []);

  // Listen for window-level mouse movement when theater is open
  useEffect(() => {
    if (!isTheaterOpen) return;

    const onMove = () => {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 4000);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchstart", onMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onMove);
    };
  }, [isTheaterOpen]);

  useEffect(() => {
    if (isOpen && activeItem) {
      setDetailData(null);
      setSelectedSeason(1);
      setSelectedEpisode(1);
      setIsTheaterOpen(false);
      setActiveServer("cinesrc");
      fetchDetail(activeItem.id, resolvedType);
      document.body.style.overflow = "hidden";

      if (autoPlay) {
        handleStartPlay();
      }
    } else {
      setDetailData(null);
      setIsTheaterOpen(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isOpen, activeItem, resolvedType, autoPlay, fetchDetail, handleStartPlay]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        if (isTheaterOpen) {
          handleExitTheater();
        } else {
          closePreview();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isTheaterOpen, closePreview, handleExitTheater]);

  if (!isOpen || !activeItem) return null;

  const title = detailData?.title || displayTitle(activeItem);
  const year = detailData?.year || displayYear(activeItem);
  const rating = detailData?.vote_average ?? activeItem.vote_average;
  const overview = detailData?.overview || activeItem.overview;
  const genres = detailData?.genres || [];
  const backdropUrl = detailData?.backdrop_path || activeItem.backdrop_path;
  const validSeasons = (detailData?.seasons || []).filter((s) => s.season_number > 0);
  const currentSeasonObj = validSeasons.find((s) => s.season_number === selectedSeason) || validSeasons[0];
  const episodeCount = currentSeasonObj?.episode_count || 10;
  const matchPercent = Math.min(99, Math.max(85, Math.round((rating || 7.5) * 10) + 12));

  // Build stream URL for the 2 active servers (CineSrc as primary)
  const idStr = String(activeItem.id);
  const streamUrl =
    activeServer === "cinesrc"
      ? resolvedType === "tv"
        ? `https://cinesrc.st/embed/tv/${idStr}?s=${selectedSeason}&e=${selectedEpisode}`
        : `https://cinesrc.st/embed/movie/${idStr}`
      : resolvedType === "tv"
      ? `https://vidsrc.wiki/embed/tv/${idStr}/${selectedSeason}/${selectedEpisode}`
      : `https://vidsrc.wiki/embed/movie/${idStr}`;

  return (
    <>
      {/* 1. TRUE FULLSCREEN THEATER PLAYER OVERLAY */}
      {isTheaterOpen && (
        <div
          className="fixed inset-0 z-[9999] w-full h-full bg-black overflow-hidden flex flex-col select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          onMouseMove={handleUserActivity}
          onClick={handleUserActivity}
        >
          {/* Top Hover Detection Sensor (triggers controls when mouse moves into top area) */}
          <div
            className="absolute top-0 inset-x-0 h-28 z-30 pointer-events-auto"
            onMouseEnter={handleUserActivity}
            onMouseMove={handleUserActivity}
          />

          {/* Minimal Persistent Undo/Back Pill when controls are hidden */}
          {!controlsVisible && (
            <button
              type="button"
              onClick={handleExitTheater}
              onMouseEnter={handleUserActivity}
              className="absolute top-4 left-4 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black/95 text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl hover:scale-105 active:scale-95 animate-fadeIn"
              title="Keluar dari pemutar (Esc)"
              aria-label="Kembali"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="text-xs font-semibold">Kembali</span>
            </button>
          )}

          {/* Floating Top Control Bar */}
          <div
            onMouseEnter={() => {
              setControlsVisible(true);
              if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            }}
            onMouseMove={() => {
              setControlsVisible(true);
              if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            }}
            onMouseLeave={() => {
              if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
              controlsTimeoutRef.current = setTimeout(() => {
                setControlsVisible(false);
              }, 3000);
            }}
            className={`absolute top-0 inset-x-0 z-40 flex items-center justify-between p-4 sm:p-5 bg-gradient-to-b from-black/95 via-black/75 to-transparent transition-all duration-300 transform ${
              controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
            }`}
          >
            {/* Left: Back Arrow + Movie/Episode Title */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                type="button"
                onClick={handleExitTheater}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-lg active:scale-95"
                title="Keluar dari pemutar (Esc)"
                aria-label="Kembali"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="min-w-0">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-white truncate drop-shadow-md">
                  {title}
                </h2>
                {resolvedType === "tv" && (
                  <p className="text-xs text-zinc-300 font-medium">
                    Season {selectedSeason} • Episode {selectedEpisode}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Server Pills + Fullscreen Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setActiveServer("cinesrc")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeServer === "cinesrc"
                      ? "bg-red-600 text-white shadow-md"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  CineSrc (Utama)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveServer("vidsrcwiki")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeServer === "vidsrcwiki"
                      ? "bg-red-600 text-white shadow-md"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  VidSrc Wiki (Server 2)
                </button>
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-lg"
                title="Toggle Layar Penuh"
                aria-label="Layar Penuh"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
            </div>
          </div>

          {/* 100% Screen Video Stream */}
          <iframe
            key={`${streamUrl}-${activeServer}`}
            src={streamUrl}
            title={title}
            className="w-full h-full border-0 overflow-hidden"
            scrolling="no"
            referrerPolicy="origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen *"
            allowFullScreen
          />
        </div>
      )}

      {/* 2. AUTHENTIC NETFLIX PREVIEW MODAL */}
      <div
        className={`fixed inset-0 z-[120] items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn ${
          isTheaterOpen ? "hidden" : "flex"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`Netflix Preview: ${title}`}
        onClick={closePreview}
      >
        <div
          className="relative w-full max-w-4xl max-h-[100vh] sm:max-h-[92vh] overflow-y-auto rounded-none sm:rounded-xl my-auto bg-[#181818] text-white shadow-[0_25px_80px_rgba(0,0,0,0.95)] select-none scrollbar-thin scrollbar-thumb-zinc-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Netflix Circular Close Button */}
          <button
            onClick={closePreview}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full flex items-center justify-center bg-[#181818] hover:bg-[#2a2a2a] text-white transition-all cursor-pointer shadow-xl active:scale-95"
            aria-label="Tutup"
            title="Tutup (Esc)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Cinematic 16:9 Backdrop Header */}
          <div className="relative w-full aspect-video min-h-[260px] sm:min-h-[420px] overflow-hidden bg-black">
            {backdropUrl ? (
              <Image
                src={`https://image.tmdb.org/t/p/w1280${backdropUrl}`}
                alt={title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 900px"
              />
            ) : (
              <div className="w-full h-full bg-[#12141a] flex items-center justify-center text-zinc-500 text-sm">
                Tidak ada pratinjau
              </div>
            )}

            {/* Seamless Netflix Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/30 via-60% to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/80 via-transparent to-transparent pointer-events-none" />

            {/* Bottom Content on Backdrop */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-10 sm:right-10 z-20">
              {/* Title in Clean Modern Sans */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-2xl">
                {title}
              </h1>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Large White Play Button */}
                <button
                  type="button"
                  onClick={() => handleStartPlay()}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded bg-white hover:bg-white/80 text-black font-extrabold text-sm sm:text-base transition-all cursor-pointer shadow-xl active:scale-95"
                  title="Putar Layar Penuh"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                  <span>Putar</span>
                </button>

                {/* My List / Favorite Button */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(activeItem)}
                  className={`inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/40 hover:border-white transition-all cursor-pointer shadow-lg active:scale-95 ${
                    fav ? "bg-white text-black border-white" : "bg-black/60 hover:bg-black/80 text-white"
                  }`}
                  title={fav ? "Hapus dari Daftar Saya" : "Tambah ke Daftar Saya"}
                  aria-label={fav ? "Hapus dari Daftar Saya" : "Tambah ke Daftar Saya"}
                >
                  {fav ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                </button>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={() => setDownloadOpen(true)}
                  className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/40 hover:border-white bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer shadow-lg active:scale-95"
                  title="Unduh Film & Subtitle"
                  aria-label="Unduh"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Netflix Two-Column Detail Body */}
          <div className="p-6 sm:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Left Column (Metadata & Synopsis) */}
              <div className="md:col-span-2 space-y-4">
                {/* Netflix Metadata Row */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold">
                  <span className="text-[#46d369] font-bold">{matchPercent}% Cocok</span>
                  {year && <span className="text-zinc-300">{year}</span>}
                  <span className="border border-white/40 px-1.5 py-0.2 rounded text-[10px] text-zinc-300 uppercase">
                    16+
                  </span>
                  {detailData?.runtime && (
                    <span className="text-zinc-300">{detailData.runtime}</span>
                  )}
                  <span className="border border-white/40 px-1 py-0.2 rounded text-[9px] text-zinc-300 font-bold uppercase">
                    Ultra HD 4K
                  </span>
                  <span className="border border-white/40 px-1 py-0.2 rounded text-[9px] text-zinc-300 font-bold uppercase">
                    CC
                  </span>
                </div>

                {/* Synopsis Paragraph */}
                <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-normal">
                  {overview || "Sinopsis belum tersedia untuk judul ini."}
                </p>
              </div>

              {/* Right Column (Cast & Genres) */}
              <div className="space-y-3.5 text-xs sm:text-sm text-zinc-400">
                {detailData?.cast && detailData.cast.length > 0 && (
                  <div>
                    <span className="text-zinc-500 font-normal">Pemeran: </span>
                    <span className="text-white font-medium">
                      {detailData.cast.slice(0, 4).map((c) => c.name).join(", ")}
                    </span>
                  </div>
                )}

                {genres.length > 0 && (
                  <div>
                    <span className="text-zinc-500 font-normal">Genre: </span>
                    <span className="text-white font-medium">
                      {genres.map((g) => g.name).join(", ")}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-zinc-500 font-normal">Acara ini: </span>
                  <span className="text-white font-medium">Mendebarkan, Populer, Seru</span>
                </div>
              </div>
            </div>

            {/* TV Series Episode Selector (if applicable) */}
            {resolvedType === "tv" && validSeasons.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-bold text-white">Episode</h3>

                  {validSeasons.length > 1 && (
                    <select
                      value={selectedSeason}
                      onChange={(e) => {
                        setSelectedSeason(Number(e.target.value));
                        setSelectedEpisode(1);
                      }}
                      className="bg-[#242424] border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded outline-none cursor-pointer"
                    >
                      {validSeasons.map((s) => (
                        <option key={s.season_number} value={s.season_number}>
                          {s.name || `Season ${s.season_number}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Episode Rows */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {Array.from({ length: Math.min(episodeCount, 40) }, (_, i) => i + 1).map((ep) => {
                    const isActive = selectedEpisode === ep;
                    return (
                      <button
                        key={ep}
                        type="button"
                        onClick={() => handleStartPlay(selectedSeason, ep)}
                        className={`py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-red-600 text-white shadow-md scale-105"
                            : "bg-[#282828] hover:bg-[#383838] text-zinc-300 hover:text-white"
                        }`}
                      >
                        EP {ep}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cast Avatars */}
            {detailData?.cast && detailData.cast.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-4">
                  Pemeran
                </h3>

                <div className="flex items-start gap-4 sm:gap-5 overflow-x-auto pb-2 scroll-snap-x scrollbar-none" role="list">
                  {detailData.cast.map((actor) => (
                    <div key={actor.id} className="shrink-0 w-20 text-center flex flex-col items-center">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden mb-2 border border-white/15 bg-zinc-800 flex items-center justify-center shadow-md">
                        {actor.profile_path ? (
                          <Image
                            src={img(actor.profile_path, "w185")}
                            alt={actor.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                            unoptimized={!actor.profile_path}
                          />
                        ) : (
                          <span className="text-xs text-zinc-400 font-bold">{actor.name.slice(0, 1)}</span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-white truncate max-w-[80px] block">
                        {actor.name}
                      </span>
                      {actor.character && (
                        <span className="text-[11px] text-zinc-400 truncate max-w-[80px] block mt-0.5">
                          {actor.character}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Konten Serupa (More Like This) */}
            {detailData?.recommendations && detailData.recommendations.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-base font-bold text-white mb-4">
                  Konten Serupa
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {detailData.recommendations.map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => openPreview(rec, false)}
                      className="group relative rounded-md overflow-hidden bg-[#242424] hover:bg-[#2e2e2e] transition-all text-left cursor-pointer active:scale-98"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                        {rec.backdrop_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w500${rec.backdrop_path}`}
                            alt={displayTitle(rec)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : rec.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w342${rec.poster_path}`}
                            alt={displayTitle(rec)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#242424] via-transparent to-transparent" />
                        {rec.vote_average > 0 && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-amber-400">
                            ★ {rec.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <span className="text-xs font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                          {displayTitle(rec)}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                          <span className="text-[#46d369] font-bold">95% Cocok</span>
                          <span>{displayYear(rec) || "Film"}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DownloadModal
          isOpen={downloadOpen}
          onClose={() => setDownloadOpen(false)}
          tmdbId={activeItem.id}
          type={resolvedType}
          title={title}
          posterPath={activeItem.poster_path}
        />
      </div>
    </>
  );
}
