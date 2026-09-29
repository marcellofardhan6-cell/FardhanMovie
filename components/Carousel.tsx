"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import MovieCard from "./MovieCard";
import Top10Card from "./Top10Card";
import LandscapeCard from "./LandscapeCard";
import { Movie } from "@/lib/tmdb";

interface Props {
  title: string;
  items: Movie[];
  seeAllHref?: string;
  subtitle?: string;
  variant?: "standard" | "top10" | "backdrop";
}

export default function Carousel({
  title,
  items,
  seeAllHref,
  subtitle,
  variant = "standard",
}: Props) {
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
    const amount = card ? card.offsetWidth * 2.5 : 300;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }, []);

  if (items.length === 0) return null;

  const displayItems = variant === "top10" ? items.slice(0, 10) : items;

  // Determine width based on variant
  const itemWidthClass = {
    standard: "w-[130px] sm:w-[160px] md:w-[190px]",
    top10: "w-[170px] sm:w-[210px] md:w-[245px]",
    backdrop: "w-[240px] sm:w-[290px] md:w-[330px]",
  }[variant];

  return (
    <section aria-label={title} className="relative group/carousel">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4 sm:mb-5">
        <div>
          <div className="flex items-center gap-2">
            {variant === "top10" && (
              <span className="w-1.5 h-5 bg-red-600 rounded-full" />
            )}
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Carousel Actions */}
        <div className="flex items-center gap-2">
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-xs font-semibold tracking-wide text-zinc-400 hover:text-white transition-colors mr-2 sm:mr-3 flex items-center gap-1 group/link"
            >
              <span>See All</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-transform group-hover/link:translate-x-0.5"
                aria-hidden
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => scrollBy("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.12] disabled:opacity-20 border border-white/[0.08] hover:border-white/30 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scrollBy("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.12] disabled:opacity-20 border border-white/[0.08] hover:border-white/30 text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
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
        className="flex gap-3 sm:gap-5 overflow-x-auto scroll-snap-x pb-4 pt-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={updateScrollState}
        tabIndex={0}
        aria-label={`${title} - use scroll buttons or arrow keys`}
      >
        <ul className="flex gap-3 sm:gap-5" role="list">
          {displayItems.map((item, i) => (
            <li
              key={`${variant}-${item.id}-${i}`}
              className={`scroll-snap-item shrink-0 ${itemWidthClass}`}
            >
              {variant === "top10" ? (
                <Top10Card item={item} rank={i + 1} priority={i < 3} />
              ) : variant === "backdrop" ? (
                <LandscapeCard item={item} priority={i < 3} />
              ) : (
                <MovieCard item={item} priority={i < 4} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
