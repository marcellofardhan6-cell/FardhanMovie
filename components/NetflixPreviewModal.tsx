"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePreviewModal } from "@/context/PreviewModalContext";
import { useFavorites } from "@/context/FavoritesContext";
import { img, displayTitle, displayYear, isTV, Genre, Movie } from "@/lib/tmdb";
import ServerSwitcher from "@/components/ServerSwitcher";
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
  const { isOpen, activeItem, isPlaying, setIsPlaying, closePreview, openPreview } = usePreviewModal();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [detailData, setDetailData] = useState<DetailApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [posterSrc, setPosterSrc] = useState<string>("/poster-placeholder.svg");

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  const resolvedType = activeItem
    ? activeItem.media_type === "tv" || isTV(activeItem)
      ? "tv"
      : "movie"
    : "movie";

  const fav = activeItem ? isFavorite(activeItem.id) : false;

  // Fetch full details when modal opens
  const fetchDetail = useCallback(async (id: number, type: "movie" | "tv") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/detail?id=${id}&type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch detail");
      const data: DetailApiResponse = await res.json();
      setDetailData(data);
      if (data.poster_path) {
        setPosterSrc(img(data.poster_path, "w500"));
      }
      if (data.seasons && data.seasons.length > 0) {
        const validSeason = data.seasons.find((s) => s.season_number > 0);
        if (validSeason) setSelectedSeason(validSeason.season_number);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && activeItem) {
      setDetailData(null);
      setSelectedSeason(1);
      setSelectedEpisode(1);
      setPosterSrc(img(activeItem.poster_path, "w500"));
      fetchDetail(activeItem.id, resolvedType);
      document.body.style.overflow = "hidden";
    } else {
      setDetailData(null);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, activeItem, resolvedType, fetchDetail]);

  // Keyboard navigation: Escape key closes modal or exits player
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        if (isPlaying) {
          setIsPlaying(false);
        } else {
          closePreview();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPlaying, closePreview, setIsPlaying]);

  // Request fullscreen immediately on click
  const handleStartPlay = useCallback(() => {
    setIsPlaying(true);
    // Smooth scroll to top of modal for uninterrupted playback
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Attempt fullscreen on player container within user gesture
    setTimeout(() => {
      const el = playerContainerRef.current;
      if (el) {
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        }
      }
    }, 100);
  }, [setIsPlaying]);

  if (!isOpen || !activeItem) return null;

  const title = detailData?.title || displayTitle(activeItem);
  const year = detailData?.year || displayYear(activeItem);
  const rating = detailData?.vote_average ?? activeItem.vote_average;
  const displayRating = rating > 0 ? rating.toFixed(1) : null;
  const overview = detailData?.overview || activeItem.overview;
  const genres = detailData?.genres || [];
  const backdropUrl = detailData?.backdrop_path || activeItem.backdrop_path;
  const isAnime = detailData?.isAnime ?? false;
  const fullDetailHref = resolvedType === "tv" ? `/series/${activeItem.id}` : `/film/${activeItem.id}`;
  const validSeasons = (detailData?.seasons || []).filter((s) => s.season_number > 0);
  const currentSeasonObj = validSeasons.find((s) => s.season_number === selectedSeason) || validSeasons[0];
  const episodeCount = currentSeasonObj?.episode_count || 10;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={`Netflix Preview: ${title}`}
      onClick={() => {
        if (isPlaying) {
          setIsPlaying(false);
        } else {
          closePreview();
        }
      }}
    >
      {/* Modal Dialog Card */}
      <div
        ref={modalScrollRef}
        className="relative w-full max-w-4xl max-h-[100vh] sm:max-h-[92vh] overflow-y-auto rounded-none sm:rounded-2xl my-auto bg-[#0a0c13] border border-white/[0.08] shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-zinc-100 scrollbar-thin scrollbar-thumb-zinc-700 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Netflix Close Button */}
        <button
          onClick={closePreview}
          className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full flex items-center justify-center bg-black/70 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/20 transition-all cursor-pointer shadow-2xl active:scale-95"
          aria-label="Close preview modal"
          title="Tutup (Esc)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Video Player or Cinematic Backdrop Banner */}
        <div ref={playerContainerRef} className="relative w-full bg-black aspect-video min-h-[250px] xs:min-h-[300px] sm:min-h-[420px]">
          {isPlaying ? (
            <div className="relative w-full h-full">
              {/* Back to details pill */}
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs font-bold border border-white/20 shadow-2xl backdrop-blur-md transition-all cursor-pointer"
                title="Kembali ke Sinopsis"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Info Film</span>
              </button>

              <ServerSwitcher
                tmdbId={activeItem.id}
                type={resolvedType}
                title={title}
                season={selectedSeason}
                episode={selectedEpisode}
                posterPath={activeItem.poster_path}
                backdropPath={activeItem.backdrop_path}
              />
            </div>
          ) : (
            <div className="relative w-full h-full overflow-hidden">
              {/* Backdrop image */}
              {backdropUrl ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w1280${backdropUrl}`}
                  alt={`Backdrop ${title}`}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 896px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#12141e] via-[#0d0f17] to-black flex items-center justify-center">
                  <span className="text-zinc-600 text-sm">No Preview Image</span>
                </div>
              )}

              {/* Multi-layered transparent dark gradients matching Netflix */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c13] via-[#0a0c13]/50 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c13]/90 via-[#0a0c13]/40 to-transparent pointer-events-none" />

              {/* Content floating on top of banner */}
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 z-20">
                {/* Anime / Series Badge */}
                <div className="flex items-center gap-2 mb-2">
                  {isAnime ? (
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#FF6400] text-black shadow-md shadow-[#FF6400]/25">
                      ANIME
                    </span>
                  ) : resolvedType === "tv" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white">
                      SERIES
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/20">
                      FILM
                    </span>
                  )}
                  {detailData?.tagline && (
                    <span className="hidden sm:inline text-xs italic text-zinc-300 truncate max-w-md">
                      "{detailData.tagline}"
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2
                  className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-2xl"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {title}
                </h2>

                {/* Netflix-style Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                  {/* Play Button: Large, White with Black Text */}
                  <button
                    type="button"
                    onClick={handleStartPlay}
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-extrabold bg-white hover:bg-zinc-200 text-black shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Putar Sekarang dan Aktifkan Fullscreen"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 3l14 9-14 9V3z" />
                    </svg>
                    <span>Putar Sekarang</span>
                  </button>

                  {/* Add to List / Favorite Button */}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(activeItem)}
                    className={`inline-flex items-center justify-center w-11 h-11 rounded-full border backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg ${
                      fav
                        ? "bg-red-600 text-white border-red-500 shadow-red-600/30"
                        : "bg-black/60 hover:bg-black/80 text-white border-white/30 hover:border-white"
                    }`}
                    title={fav ? "Hapus dari Daftar Favorit" : "Tambah ke Daftar Favorit"}
                    aria-label={fav ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                  >
                    {fav ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </button>

                  {/* Download Video Button */}
                  <button
                    type="button"
                    onClick={() => setDownloadOpen(true)}
                    className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/30 hover:border-white backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
                    title="Download Video & Subtitles"
                    aria-label="Download"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>

                  {/* Link to Full Dedicated Page */}
                  <Link
                    href={fullDetailHref}
                    onClick={closePreview}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 hover:text-white border border-white/15 transition-all active:scale-95 cursor-pointer"
                    title="Buka halaman penuh"
                  >
                    <span>Halaman Penuh</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body: Two Column Netflix Layout */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Top Meta & Overview Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column (2 Cols): Metadata & Synopsis */}
            <div className="md:col-span-2 space-y-4">
              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
                {displayRating && (
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <span className="text-sm">★</span>
                    <span>{displayRating}</span>
                  </span>
                )}
                {year && <span className="text-zinc-300 font-semibold">{year}</span>}
                {detailData?.runtime && (
                  <span className="text-zinc-400">{detailData.runtime}</span>
                )}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-300 border border-white/20 bg-white/[0.05]">
                  HD
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-300 border border-white/20 bg-white/[0.05]">
                  CC
                </span>
              </div>

              {/* Synopsis */}
              {overview ? (
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                  {overview}
                </p>
              ) : (
                <p className="text-sm text-zinc-500 italic">Sinopsis belum tersedia untuk judul ini.</p>
              )}
            </div>

            {/* Right Column: Genres & Metadata Summary */}
            <div className="space-y-4 text-xs sm:text-sm border-t md:border-t-0 md:border-l border-white/[0.08] pt-4 md:pt-0 md:pl-6">
              {genres.length > 0 && (
                <div>
                  <span className="text-zinc-500 block mb-1.5 font-medium">Genre:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((g) => (
                      <span
                        key={g.id}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/[0.05] border border-white/10 text-zinc-300"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-zinc-500 block mb-1 font-medium">Audio &amp; Subtitle:</span>
                <span className="text-zinc-300 font-medium">Indonesia, English (Multi-Language)</span>
              </div>

              <div>
                <span className="text-zinc-500 block mb-1 font-medium">Kualitas:</span>
                <span className="text-zinc-300 font-medium">1080p Full HD</span>
              </div>
            </div>
          </div>

          {/* TV Series Episode Selector (if applicable) */}
          {resolvedType === "tv" && validSeasons.length > 0 && (
            <div className="pt-6 border-t border-white/[0.08]">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide" style={{ fontFamily: "var(--font-fraunces)" }}>
                  Episode
                </h3>

                {validSeasons.length > 1 && (
                  <select
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(Number(e.target.value));
                      setSelectedEpisode(1);
                    }}
                    className="bg-[#141620] border border-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                  >
                    {validSeasons.map((s) => (
                      <option key={s.season_number} value={s.season_number}>
                        {s.name || `Season ${s.season_number}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Episode Numbers Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {Array.from({ length: Math.min(episodeCount, 40) }, (_, i) => i + 1).map((ep) => {
                  const isActive = selectedEpisode === ep;
                  return (
                    <button
                      key={ep}
                      type="button"
                      onClick={() => {
                        setSelectedEpisode(ep);
                        handleStartPlay();
                      }}
                      className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                          : "bg-white/[0.05] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10"
                      }`}
                    >
                      EP {ep}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cast / Aktor Section */}
          {detailData?.cast && detailData.cast.length > 0 && (
            <div className="pt-6 border-t border-white/[0.08]">
              <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-4">
                Pemeran
              </h3>

              <div
                className="flex items-start gap-4 sm:gap-5 overflow-x-auto pb-2 scroll-snap-x"
                style={{ scrollbarWidth: "none" }}
                role="list"
              >
                {detailData.cast.map((actor) => (
                  <div
                    key={actor.id}
                    className="shrink-0 w-20 sm:w-24 text-center scroll-snap-item flex flex-col items-center"
                  >
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2 border border-white/10 bg-[#161822] shadow-md flex items-center justify-center">
                      {actor.profile_path ? (
                        <Image
                          src={img(actor.profile_path, "w185")}
                          alt={actor.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized={!actor.profile_path}
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#1e2029] flex items-center justify-center text-zinc-500">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-white truncate max-w-[80px] sm:max-w-[90px] block leading-snug">
                      {actor.name}
                    </span>
                    {actor.character && (
                      <span className="text-[11px] text-zinc-400 truncate max-w-[80px] sm:max-w-[90px] block mt-0.5 leading-snug">
                        {actor.character}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More Like This (Rekomendasi Lainnya) */}
          {detailData?.recommendations && detailData.recommendations.length > 0 && (
            <div className="pt-6 border-t border-white/[0.08]">
              <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
                Mungkin Anda Suka
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {detailData.recommendations.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => openPreview(rec, false)}
                    className="group relative rounded-xl overflow-hidden bg-[#12141c] border border-white/[0.08] hover:border-red-500/50 transition-all text-left cursor-pointer active:scale-98"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      {rec.vote_average > 0 && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-amber-400">
                          ★ {rec.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <span className="text-xs font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                        {displayTitle(rec)}
                      </span>
                      <span className="text-[11px] text-zinc-500 block mt-0.5">
                        {displayYear(rec) || "Film"}
                      </span>
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
  );
}
