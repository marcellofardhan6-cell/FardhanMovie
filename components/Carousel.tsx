"use client";
import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import MovieCard from "./MovieCard";
import { Movie } from "@/lib/tmdb";

interface Props {
  title: string;
  items: Movie[];
  seeAllHref?: string;
}

export default function Carousel({ title, items, seeAllHref }: Props) {
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
    <section aria-label={title} className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)" }}
        >
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-xs font-medium transition-colors mr-2"
              style={{ color: "var(--accent)" }}
            >
              Lihat semua
            </Link>
          )}
          <button
            onClick={() => scrollBy("left")}
            disabled={!canScrollLeft}
            aria-label="Geser kiri"
            className="p-2 rounded transition-colors disabled:opacity-30"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scrollBy("right")}
            disabled={!canScrollRight}
            aria-label="Geser kanan"
            className="p-2 rounded transition-colors disabled:opacity-30"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-snap-x pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={updateScrollState}
        tabIndex={0}
        aria-label={`${title} - gunakan tombol panah untuk menggeser`}
      >
        <ul className="flex gap-4" role="list">
          {items.map((item, i) => (
            <li key={`${item.id}-${i}`} className="scroll-snap-item shrink-0 w-[160px] sm:w-[180px]">
              <MovieCard item={item} priority={i < 4} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
