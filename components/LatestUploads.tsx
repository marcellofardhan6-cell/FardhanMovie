"use client";

import { useState } from "react";
import Link from "next/link";
import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";

interface Props {
  initialAll: Movie[];
  initialMovies: Movie[];
  initialTV: Movie[];
}

type TabType = "all" | "movie" | "tv";

export default function LatestUploads({
  initialAll,
  initialMovies,
  initialTV,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const getItems = () => {
    switch (activeTab) {
      case "movie":
        return initialMovies;
      case "tv":
        return initialTV;
      case "all":
      default:
        return initialAll;
    }
  };

  const currentItems = getItems();

  const getSeeAllHref = () => {
    switch (activeTab) {
      case "tv":
        return "/series";
      case "movie":
      case "all":
      default:
        return "/films?sort=latest";
    }
  };

  return (
    <section aria-label="Upload Terbaru" className="relative pt-4 sm:pt-6">
      {/* Header with Title and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-red-600 rounded-full" aria-hidden="true" />
            <h2
              className="text-xl sm:text-2xl font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Upload Terbaru
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 pl-4">
            Film dan serial rilis resmi terbaru kualitas HD / WEB-DL
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2" role="tablist" aria-label="Pilihan upload terbaru">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "all"
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                : "bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.1] border border-white/[0.06]"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "movie"}
            onClick={() => setActiveTab("movie")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "movie"
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                : "bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.1] border border-white/[0.06]"
            }`}
          >
            Film
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "tv"}
            onClick={() => setActiveTab("tv")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === "tv"
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                : "bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.1] border border-white/[0.06]"
            }`}
          >
            Serial
          </button>
          <Link
            href={getSeeAllHref()}
            className="hidden sm:inline-flex items-center gap-1 ml-3 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Lihat Semua
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Grid of Cards */}
      {currentItems.length === 0 ? (
        <div className="py-16 text-center rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <p className="text-sm text-zinc-400">Tidak ada konten upload terbaru saat ini.</p>
        </div>
      ) : (
        <ul
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
          role="list"
        >
          {currentItems.slice(0, 18).map((item, idx) => (
            <li key={`${item.id}-${item.media_type || "item"}-${idx}`}>
              <MovieCard item={item} priority={idx < 6} />
            </li>
          ))}
        </ul>
      )}

      {/* Bottom Button to See More */}
      <div className="mt-8 flex justify-center">
        <Link
          href={getSeeAllHref()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/20 transition-all duration-200 shadow-sm"
        >
          Lihat Semua Rilis Terbaru
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
