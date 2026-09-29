import { searchMulti } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import type { Metadata } from "next";

export const revalidate = 300;

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  return { title: params.q ? `Hasil: "${params.q}"` : "Pencarian" };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Number(params.page ?? 1);

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-8">
          Pencarian Film &amp; Serial
        </h1>
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-[#0c0e17] border border-white/[0.08] text-center px-4">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-zinc-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p className="text-base font-bold text-white mb-1">
            Temukan Tayangan Favoritmu
          </p>
          <p className="text-xs text-zinc-400 max-w-sm">
            Ketik judul film, serial TV, atau anime pada kolom pencarian di atas.
          </p>
        </div>
      </div>
    );
  }

  const data = await searchMulti(query, page).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 }));
  const items = data.results.filter((item) => item.poster_path && (item.media_type === "movie" || item.media_type === "tv"));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Hasil pencarian &ldquo;{query}&rdquo;
        </h1>
        {data.total_results > 0 && (
          <p className="text-xs text-zinc-400 mt-1">
            Ditemukan {data.total_results.toLocaleString("id-ID")} tayangan yang relevan.
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-[#0c0e17] border border-white/[0.08] text-center px-4">
          <p className="text-base font-bold text-white mb-1">
            Tidak ada hasil untuk &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-zinc-400">
            Coba periksa ejaan atau gunakan kata kunci judul yang lebih umum.
          </p>
        </div>
      ) : (
        <MovieGrid items={items} />
      )}

      {data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          {page > 1 && (
            <a
              href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
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
              href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
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
