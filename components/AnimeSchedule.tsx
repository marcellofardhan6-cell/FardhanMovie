"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Movie, img, displayTitle } from "@/lib/tmdb";

interface Props {
  items: Movie[];
}

const DAYS = [
  { key: "mon", label: "Mon", dayIndex: 1 },
  { key: "tue", label: "Tue", dayIndex: 2 },
  { key: "wed", label: "Wed", dayIndex: 3 },
  { key: "thu", label: "Thu", dayIndex: 4 },
  { key: "fri", label: "Fri", dayIndex: 5 },
  { key: "sat", label: "Sat", dayIndex: 6 },
  { key: "sun", label: "Sun", dayIndex: 0 },
];

export default function AnimeSchedule({ items }: Props) {
  // Determine today's day of week
  const todayIndex = new Date().getDay();
  const defaultDay = DAYS.find((d) => d.dayIndex === todayIndex)?.key || "wed";

  const [activeDay, setActiveDay] = useState<string>(defaultDay);

  // Group anime items into days of the week deterministically
  const scheduleMap = useMemo(() => {
    const map: Record<string, Movie[]> = {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    };

    if (!items || items.length === 0) return map;

    items.forEach((item, index) => {
      const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
      const targetDay = dayKeys[(item.id + index) % 7];
      map[targetDay].push(item);
    });

    // Ensure every day has at least 3-4 items by fallback
    dayKeysLoop: for (const key of Object.keys(map)) {
      if (map[key].length < 3) {
        for (const item of items) {
          if (!map[key].some((m) => m.id === item.id)) {
            map[key].push(item);
            if (map[key].length >= 4) break;
          }
        }
      }
    }

    return map;
  }, [items]);

  const activeAnimeList = scheduleMap[activeDay] || [];

  return (
    <section className="rounded-2xl bg-[#0d0f15] border border-white/[0.08] p-5 sm:p-7 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Anime Release Schedule
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            New episodes streaming weekly
          </p>
        </div>
      </div>

      {/* Days of Week Tab Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none mb-6 border-b border-white/[0.06] relative z-10">
        {DAYS.map((d) => {
          const isSelected = activeDay === d.key;
          const isToday = d.dayIndex === todayIndex;

          return (
            <button
              key={d.key}
              onClick={() => setActiveDay(d.key)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-[#FF6400] text-black shadow-md shadow-[#FF6400]/25 font-black"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06]"
              }`}
            >
              <span>{d.label}</span>
              {isToday && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider ${
                    isSelected ? "bg-black text-[#FF6400]" : "bg-[#FF6400]/20 text-[#FF6400]"
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Anime Schedule Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
        {activeAnimeList.map((item, idx) => {
          const title = displayTitle(item);
          const posterUrl = img(item.poster_path, "w342");
          const episodeNumber = ((item.id % 24) || 12) + (idx % 2);
          const airingHours = ["17:30", "18:00", "19:30", "20:00", "21:30", "22:00"][
            (item.id + idx) % 6
          ];

          return (
            <Link
              key={`schedule-${item.id}-${idx}`}
              href={`/series/${item.id}`}
              className="group block rounded-xl overflow-hidden bg-[#131620] border border-white/[0.08] hover:border-[#FF6400]/60 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Poster with Airing Badge */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
                <Image
                  src={posterUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized={posterUrl.startsWith("/")}
                />

                {/* Airing Time Pill */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black bg-black/80 text-white backdrop-blur-md border border-white/10">
                  {airingHours} JST
                </div>

                {/* Episode Badge in Crunchyroll Orange */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-black bg-[#FF6400] text-black shadow-sm">
                  EP {episodeNumber}
                </div>

                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-zinc-300 backdrop-blur-sm">
                  SUB
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-[#FF6400] transition-colors">
                  {title}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                  Ongoing • This Season
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
