"use client";

import { useEffect, useState, useCallback } from "react";
import { Movie, displayTitle, displayYear, isTV, Genre } from "@/lib/tmdb";
import DetailCard, { CastMember } from "./DetailCard";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Movie | null;
  isAnime?: boolean;
}

interface DetailApiResponse {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  runtime: string | null;
  year: string;
  genres: Genre[];
  overview: string | null;
  isAnime: boolean;
  cast: CastMember[];
}

export default function DetailModal({
  isOpen,
  onClose,
  item,
  isAnime = false,
}: DetailModalProps) {
  const [detailData, setDetailData] = useState<DetailApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const resolvedType = item ? (item.media_type === "tv" || isTV(item) ? "tv" : "movie") : "movie";

  const fetchDetail = useCallback(async (id: number, type: "movie" | "tv") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/detail?id=${id}&type=${type}`);
      if (!res.ok) throw new Error("Failed to fetch detail");
      const data = await res.json();
      setDetailData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && item) {
      setDetailData(null);
      fetchDetail(item.id, resolvedType);
      document.body.style.overflow = "hidden";
    } else {
      setDetailData(null);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, item, resolvedType, fetchDetail]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={`Detail: ${displayTitle(item)}`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl my-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Netflix-style Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full flex items-center justify-center bg-black/70 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/15 transition-all cursor-pointer shadow-lg active:scale-95"
          aria-label="Tutup detail"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <DetailCard
          tmdbId={item.id}
          title={detailData?.title || displayTitle(item)}
          posterPath={detailData?.poster_path !== undefined ? detailData.poster_path : item.poster_path}
          rating={detailData?.vote_average ?? item.vote_average}
          runtime={detailData?.runtime ?? null}
          year={detailData?.year || displayYear(item)}
          genres={detailData?.genres || []}
          overview={detailData?.overview || item.overview}
          cast={detailData?.cast || []}
          type={resolvedType}
          isAnime={detailData?.isAnime ?? isAnime}
          showWatchNow={true}
        />
      </div>
    </div>
  );
}
