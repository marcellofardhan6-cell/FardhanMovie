import { discoverTV, getTVGenres } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import FilterBar from "@/components/FilterBar";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Katalog Serial TV" };
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
    discoverTV({ genre, year, page }).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getTVGenres().catch(() => []),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Editorial Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Serial TV
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Daftar serial drama, komedi, thriller, dan rilisan season lengkap.
        </p>
      </div>

      <Suspense>
        <FilterBar
          genres={genres}
          activeGenre={genre}
          activeYear={year}
          basePath="/series"
        />
      </Suspense>

      {data.results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-[#0c0e17] border border-white/[0.08]">
          <p className="text-lg font-bold text-white mb-2">
            Tidak ada serial ditemukan
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
              href={`/series?${new URLSearchParams({ ...(genre ? { genre } : {}), ...(year ? { year } : {}), page: String(page - 1) }).toString()}`}
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
              href={`/series?${new URLSearchParams({ ...(genre ? { genre } : {}), ...(year ? { year } : {}), page: String(page + 1) }).toString()}`}
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
