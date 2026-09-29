import { discoverTV, getTVGenres } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import FilterBar from "@/components/FilterBar";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Serial TV" };
export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ genre?: string; year?: string; page?: string }>;
}

export default async function SeriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const genre = params.genre;
  const year = params.year;
  const page = Number(params.page ?? 1);

  const [data, genres] = await Promise.all([
    discoverTV({ genre, year, page }),
    getTVGenres(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <h1
        className="text-3xl font-black mb-8"
        style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)" }}
      >
        Serial TV
      </h1>
      <Suspense>
        <FilterBar
          genres={genres}
          activeGenre={genre}
          activeYear={year}
          basePath="/series"
        />
      </Suspense>
      {data.results.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-lg font-semibold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-fraunces)" }}>Tidak ada serial</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Coba ubah filter pencarian.</p>
        </div>
      ) : (
        <MovieGrid items={data.results} />
      )}

      {data.total_pages > 1 && (
        <div className="flex justify-center gap-3 mt-10">
          {page > 1 && (
            <a href={`/series?${new URLSearchParams({ ...(genre ? { genre } : {}), ...(year ? { year } : {}), page: String(page - 1) }).toString()}`}
              className="px-5 py-2 rounded text-sm font-medium" style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}>Sebelumnya</a>
          )}
          <span className="px-5 py-2 text-sm" style={{ color: "var(--text-muted)" }}>Hal. {page} / {Math.min(data.total_pages, 500)}</span>
          {page < data.total_pages && page < 500 && (
            <a href={`/series?${new URLSearchParams({ ...(genre ? { genre } : {}), ...(year ? { year } : {}), page: String(page + 1) }).toString()}`}
              className="px-5 py-2 rounded text-sm font-medium" style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}>Berikutnya</a>
          )}
        </div>
      )}
    </div>
  );
}
