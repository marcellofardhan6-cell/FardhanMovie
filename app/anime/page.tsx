import { getAnime } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Katalog Anime" };
export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AnimePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const data = await getAnime(page).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Koleksi Anime
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Serial animasi Jepang, shonen, seinen, dan film anime populer.
        </p>
      </div>

      <MovieGrid items={data.results} />

      {data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          {page > 1 && (
            <a
              href={`/anime?page=${page - 1}`}
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
              href={`/anime?page=${page + 1}`}
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
