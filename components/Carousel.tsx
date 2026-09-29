"use client";
import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import MovieCard from "./MovieCard";
import { Movie } from "@/lib/tmdb";

interface Props {
  title: string;
  items: Movie[];
  seeAllHref?: string;
  subtitle?: string;
}

export default function Carousel({ title, items, seeAllHref, subtitle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  const scrollBy = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("li") as HTMLElement | null;
    const amount = card ? card.offsetWidth + 16 : 220;
    el.scrollBy({ left: dir === "left" ? -amount * 3 : amount * 3, behavior: "smooth" });
  }, []);

  if (items.length === 0) return null;

  return (
    <section aria-label={title} className="relative group/carousel">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
            {title}
          </h2>
        </div>

        {/* Carousel Actions */}
        <div className="flex items-center gap-2">
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-xs font-semibold tracking-wide text-zinc-400 hover:text-white transition-colors mr-3 flex items-center gap-1 group/link"
            >
              <span>Lihat Semua</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="transition-transform group-hover/link:translate-x-0.5" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollBy("left")}
              disabled={!canScrollLeft}
              aria-label="Geser ke kiri"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.1] disabled:opacity-20 border border-white/[0.08] hover:border-white/30 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scrollBy("right")}
              disabled={!canScrollRight}
              aria-label="Geser ke kanan"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.1] disabled:opacity-20 border border-white/[0.08] hover:border-white/30 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Slider Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scroll-snap-x pb-4 pt-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={updateScrollState}
        tabIndex={0}
        aria-label={`${title} - gunakan tombol geser atau panah`}
      >
        <ul className="flex gap-4 sm:gap-5" role="list">
          {items.map((item, i) => (
            <li key={`${item.id}-${i}`} className="scroll-snap-item shrink-0 w-[160px] sm:w-[190px]">
              <MovieCard item={item} priority={i < 4} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
