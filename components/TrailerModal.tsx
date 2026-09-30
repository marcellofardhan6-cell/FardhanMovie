"use client";

import { useEffect, useState, useCallback } from "react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tmdbId: number;
  type?: "movie" | "tv";
}

export default function TrailerModal({
  isOpen,
  onClose,
  title,
  tmdbId,
  type = "movie",
}: TrailerModalProps) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTrailer = useCallback(async () => {
    if (!tmdbId) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/trailer?id=${tmdbId}&type=${type}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      if (data.trailer?.key) {
        setTrailerKey(data.trailer.key);
      } else {
        setTrailerKey(null);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [tmdbId, type]);

  useEffect(() => {
    if (isOpen) {
      fetchTrailer();
      document.body.style.overflow = "hidden";
    } else {
      setTrailerKey(null);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, fetchTrailer]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={`Official Trailer - ${title}`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0d0f15] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#090b10]">
          <div className="flex items-center gap-2 truncate pr-4">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              Trailer: <span className="text-zinc-300 font-normal">{title}</span>
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close trailer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Container (16:9) */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-400 font-medium">Loading trailer...</p>
            </div>
          ) : trailerKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`Trailer ${title}`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center px-6 py-12">
              <p className="text-4xl mb-3">🎬</p>
              <h4 className="text-base font-bold text-white mb-1">Trailer Unavailable</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Official trailer for {title} is not available on YouTube.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
