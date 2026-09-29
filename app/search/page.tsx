import { searchMulti } from "@/lib/tmdb";
import MovieGrid from "@/components/MovieGrid";
import type { Metadata } from "next";
import { Suspense } from "react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-3xl font-black mb-4" style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)" }}>Pencarian</h1>
        <div
          className="flex flex-col items-center justify-center py-24 rounded-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "var(--text-muted)", marginBottom: "12px" }} aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Ketik judul film atau serial di kotak pencarian atas.</p>
        </div>
      </div>
    );
  }

  const data = await searchMulti(query, page);
  const items = data.results.filter((item) => item.poster_path && (item.media_type === "movie" || item.media_type === "tv"));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)" }}>
          Hasil untuk "{query}"
        </h1>
        {data.total_results > 0 && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {data.total_results.toLocaleString("id-ID")} hasil ditemukan
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-lg font-semibold mb-2" style={{ color: "var(--text)", fontFamily: "var(--font-fraunces)" }}>Tidak ada hasil</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Coba kata kunci lain.</p>
        </div>
      ) : (
        <MovieGrid items={items} />
      )}

      {data.total_pages > 1 && (
        <div className="flex justify-center gap-3 mt-10">
          {page > 1 && (
            <a href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`} className="px-5 py-2 rounded text-sm font-medium" style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}>Sebelumnya</a>
          )}
          <span className="px-5 py-2 text-sm" style={{ color: "var(--text-muted)" }}>Hal. {page} / {Math.min(data.total_pages, 500)}</span>
          {page < data.total_pages && page < 500 && (
            <a href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`} className="px-5 py-2 rounded text-sm font-medium" style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}>Berikutnya</a>
          )}
        </div>
      )}
    </div>
  );
}
