"use client";
import { useState } from "react";
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
    <section aria-label="Pilih episode" className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <div
        className="p-4"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-fraunces)" }}>Episode</span>
          <div>
            <label htmlFor="season-select" className="sr-only">Pilih season</label>
            <select
              id="season-select"
              value={currentSeason}
              onChange={(e) => onSeasonChange(Number(e.target.value))}
              className="text-sm rounded px-3 py-1.5"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                outline: "none",
              }}
              aria-label="Pilih season"
            >
              {validSeasons.map((s) => (
                <option key={s.season_number} value={s.season_number}>
                  {s.name || `Season ${s.season_number}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Episodes grid */}
      <div className="p-4" style={{ background: "var(--bg)" }}>
        {episodes.length === 0 ? (
          <div className="py-8 text-center">
            <p style={{ color: "var(--text-muted)" }} className="text-sm">Data episode tidak tersedia.</p>
          </div>
        ) : (
          <ul
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2"
            role="list"
            aria-label={`Episode Season ${currentSeason}`}
          >
            {episodes.map((ep) => (
              <li key={ep.episode_number}>
                <button
                  onClick={() => onSelect(currentSeason, ep.episode_number)}
                  aria-label={`Episode ${ep.episode_number}: ${ep.name}`}
                  aria-pressed={currentEpisode === ep.episode_number}
                  className="w-full py-2 px-1 rounded text-sm font-medium transition-all text-center"
                  style={{
                    background:
                      currentEpisode === ep.episode_number
                        ? "var(--accent)"
                        : "var(--surface)",
                    color:
                      currentEpisode === ep.episode_number
                        ? "#0a0a0f"
                        : "var(--text-muted)",
                    border: `1px solid ${
                      currentEpisode === ep.episode_number
                        ? "var(--accent)"
                        : "var(--border)"
                    }`,
                    fontWeight: currentEpisode === ep.episode_number ? 600 : 400,
                  }}
                  title={ep.name}
                >
                  {ep.episode_number}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
