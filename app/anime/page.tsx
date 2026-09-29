import { getAnime, getTVGenres } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Anime" };
export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AnimePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const data = await getAnime(page);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mb-8">
        <h1
          className="text-3xl font-black mb-2"
          style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)" }}
        >
          Anime
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Animasi Jepang terpopuler</p>
      </div>
      <MovieGrid items={data.results} />
      {data.total_pages > 1 && (
        <div className="flex justify-center gap-3 mt-10">
          {page > 1 && (
            <a href={`/anime?page=${page - 1}`} className="px-5 py-2 rounded text-sm font-medium" style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}>Sebelumnya</a>
          )}
          <span className="px-5 py-2 text-sm" style={{ color: "var(--text-muted)" }}>Hal. {page} / {Math.min(data.total_pages, 500)}</span>
          {page < data.total_pages && page < 500 && (
            <a href={`/anime?page=${page + 1}`} className="px-5 py-2 rounded text-sm font-medium" style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}>Berikutnya</a>
          )}
        </div>
      )}
    </div>
  );
}
