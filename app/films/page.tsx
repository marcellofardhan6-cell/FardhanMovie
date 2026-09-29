import { discoverMovies, getMovieGenres } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import FilterBar from "@/components/FilterBar";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Katalog Film" };
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
    discoverMovies({ genre, year, sort_by: sort, page }).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getMovieGenres().catch(() => []),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Editorial Page Header */}
      <div className="mb-8">
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-amber-400 block mb-1">
          ARSIP BIOSKOP
        </span>
        <h1
          className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          Katalog Film
          <span className="w-2 h-2 rounded-full bg-amber-400" />
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Telusuri koleksi film box office, blockbuster internasional, dan indie pilihan.
        </p>
      </div>

      <Suspense>
        <FilterBar
          genres={genres}
          activeGenre={genre}
          activeYear={year}
          basePath="/films"
        />
      </Suspense>

      {data.results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-[#0c0e17] border border-white/[0.08]">
          <p className="text-lg font-bold text-white mb-2" style={{ fontFamily: "var(--font-fraunces)" }}>
            Tidak ada film ditemukan
          </p>
          <p className="text-xs text-zinc-400">Silakan sesuaikan pilihan genre atau tahun rilis.</p>
        </div>
      ) : (
        <MovieGrid items={data.results} />
      )}

      {/* Luxury Pagination */}
      {data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          {page > 1 && (
            <a
              href={`/films?${new URLSearchParams({ ...(genre ? { genre } : {}), ...(year ? { year } : {}), page: String(page - 1) }).toString()}`}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] hover:border-amber-400/40 transition-all cursor-pointer"
            >
              &larr; Sebelumnya
            </a>
          )}
          <span className="px-4 py-2 text-xs font-medium text-zinc-400 bg-black/40 rounded-full border border-white/[0.05]">
            Halaman {page} dari {Math.min(data.total_pages, 500)}
          </span>
          {page < data.total_pages && page < 500 && (
            <a
              href={`/films?${new URLSearchParams({ ...(genre ? { genre } : {}), ...(year ? { year } : {}), page: String(page + 1) }).toString()}`}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] hover:border-amber-400/40 transition-all cursor-pointer"
            >
              Berikutnya &rarr;
            </a>
          )}
        </div>
      )}
    </div>
  );
}
