"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Genre } from "@/lib/tmdb";

interface Props {
  genres: Genre[];
  activeGenre?: string;
  activeYear?: string;
  activeType?: string;
  showTypeFilter?: boolean;
  basePath: string;
}

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

export default function FilterBar({
  genres,
  activeGenre,
  activeYear,
  activeType,
  showTypeFilter = false,
  basePath,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${basePath}?${params.toString()}`);
      });
    },
    [router, searchParams, basePath]
  );

  const selectStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
    opacity: isPending ? 0.6 : 1,
  };

  return (
    <div
      className="flex flex-wrap gap-3 items-center p-4 rounded-lg mb-6"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      role="group"
      aria-label="Filter konten"
    >
      <span className="text-sm font-medium mr-1" style={{ color: "var(--text-muted)" }}>Filter:</span>

      {showTypeFilter && (
        <div>
          <label htmlFor="filter-type" className="sr-only">Tipe konten</label>
          <select
            id="filter-type"
            value={activeType ?? ""}
            onChange={(e) => updateFilter("type", e.target.value)}
            style={selectStyle}
            disabled={isPending}
          >
            <option value="">Semua Tipe</option>
            <option value="movie">Film</option>
            <option value="tv">Serial TV</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="filter-genre" className="sr-only">Genre</label>
        <select
          id="filter-genre"
          value={activeGenre ?? ""}
          onChange={(e) => updateFilter("genre", e.target.value)}
          style={selectStyle}
          disabled={isPending}
        >
          <option value="">Semua Genre</option>
          {genres.map((g) => (
            <option key={g.id} value={String(g.id)}>{g.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-year" className="sr-only">Tahun rilis</label>
        <select
          id="filter-year"
          value={activeYear ?? ""}
          onChange={(e) => updateFilter("year", e.target.value)}
          style={selectStyle}
          disabled={isPending}
        >
          <option value="">Semua Tahun</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {(activeGenre || activeYear || activeType) && (
        <button
          onClick={() => {
            const params = new URLSearchParams();
            startTransition(() => router.push(basePath));
          }}
          className="text-xs font-medium transition-colors px-3 py-2 rounded"
          style={{ color: "var(--text-muted)", border: "1px solid var(--border)", background: "transparent" }}
          disabled={isPending}
        >
          Reset
        </button>
      )}

      {isPending && (
        <div
          className="w-4 h-4 border-2 border-transparent rounded-full animate-spin"
          style={{ borderTopColor: "var(--accent)" }}
          aria-label="Memuat..."
          role="status"
        />
      )}
    </div>
  );
}
