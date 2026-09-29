import { discoverMovies, getMovieGenres } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import FilterBar from "@/components/FilterBar";
import { Suspense } from "react";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Film" };
export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ genre?: string; year?: string; sort?: string; page?: string }>;
}

export default async function FilmsPage({ searchParams }: Props) {
  const params = await searchParams;
  const genre = params.genre;
  const year = params.year;
  const sort = params.sort === "top_rated" ? "vote_average.desc" : "popularity.desc";
  const page = Number(params.page ?? 1);

  const [data, genres] = await Promise.all([
    discoverMovies({ genre, year, sort_by: sort, page }),
    getMovieGenres(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <h1
        className="text-3xl font-black mb-8"
        style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)" }}
      >
        Film
      </h1>
      <Suspense>
        <FilterBar
          genres={genres}
          activeGenre={genre}
          activeYear={year}
          basePath="/films"
        />
      </Suspense>
      {data.results.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-lg font-semibold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-fraunces)" }}>Tidak ada film</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Coba ubah filter pencarian.</p>
        </div>
      ) : (
        <MovieGrid items={data.results} />
      )}

      {/* Pagination */}
      {data.total_pages > 1 && (
        <div className="flex justify-center gap-3 mt-10">
          {page > 1 && (
            <a
              href={`/films?${new URLSearchParams({ ...(genre ? { genre } : {}), ...(year ? { year } : {}), page: String(page - 1) }).toString()}`}
              className="px-5 py-2 rounded text-sm font-medium transition-colors"
              style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}
            >
              Sebelumnya
            </a>
          )}
          <span className="px-5 py-2 text-sm" style={{ color: "var(--text-muted)" }}>Hal. {page} / {Math.min(data.total_pages, 500)}</span>
          {page < data.total_pages && page < 500 && (
            <a
              href={`/films?${new URLSearchParams({ ...(genre ? { genre } : {}), ...(year ? { year } : {}), page: String(page + 1) }).toString()}`}
              className="px-5 py-2 rounded text-sm font-medium transition-colors"
              style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}
            >
              Berikutnya
            </a>
          )}
        </div>
      )}
    </div>
  );
}
