"use client";
import { Season, Episode } from "@/lib/tmdb";

interface Props {
  seasons: Season[];
  onSelect: (season: number, episode: number) => void;
  currentSeason: number;
  currentEpisode: number;
  episodesMap: Record<number, Episode[]>;
  onSeasonChange: (season: number) => void;
}

export default function EpisodeSelector({
  seasons,
  onSelect,
  currentSeason,
  currentEpisode,
  episodesMap,
  onSeasonChange,
}: Props) {
  const validSeasons = seasons.filter((s) => s.season_number > 0);
  const episodes = episodesMap[currentSeason] ?? [];

  return (
    <section aria-label="Pilih episode" className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0c12]">
      {/* Header & Season Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-[#0e1018] via-[#121522] to-[#0e1018] border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
              Daftar Episode
            </h3>
            <p className="text-[11px] text-zinc-400">Pilih season dan nomor episode</p>
          </div>
        </div>

        {/* Season Selector Dropdown */}
        <div className="relative">
          <label htmlFor="season-select" className="sr-only">Pilih season</label>
          <select
            id="season-select"
            value={currentSeason}
            onChange={(e) => onSeasonChange(Number(e.target.value))}
            className="text-xs font-semibold rounded-xl px-4 py-2.5 bg-white/[0.06] border border-white/[0.12] hover:border-amber-400/40 text-zinc-200 outline-none cursor-pointer transition-colors"
            aria-label="Pilih season"
          >
            {validSeasons.map((s) => (
              <option key={s.season_number} value={s.season_number} className="bg-[#0e1018] text-white">
                {s.name || `Season ${s.season_number}`} ({s.episode_count} Episode)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="p-4 sm:p-5 bg-[#07080d]">
        {episodes.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-xs text-zinc-400">Memuat episode Season {currentSeason}...</p>
          </div>
        ) : (
          <ul
            className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2"
            role="list"
            aria-label={`Episode Season ${currentSeason}`}
          >
            {episodes.map((ep) => {
              const isActive = currentEpisode === ep.episode_number;
              return (
                <li key={ep.episode_number}>
                  <button
                    onClick={() => onSelect(currentSeason, ep.episode_number)}
                    aria-label={`Episode ${ep.episode_number}: ${ep.name}`}
                    aria-pressed={isActive}
                    className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 text-center cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_20px_rgba(229,169,59,0.4)] scale-105"
                        : "bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06]"
                    }`}
                    title={ep.name}
                  >
                    <span>EP {ep.episode_number}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
