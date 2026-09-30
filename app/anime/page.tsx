import {
  getAnime,
  getAnimeActionShonen,
  getAnimeMovies,
  getAnimeTopRated,
  getAnimeFantasyIsekai,
  displayTitle,
} from "@/lib/tmdb";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import MovieGrid from "@/components/MovieGrid";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime Portal - FardTV",
  description: "Nonton anime sub & dub Indo terlengkap, streaming serial anime populer, box office movie, dan anime musim terbaru gratis di FardTV.",
};

export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ page?: string; genre?: string }>;
}

const ANIME_GENRES = [
  { id: "", label: "✨ Semua" },
  { id: "10759", label: "⚔️ Action & Shonen" },
  { id: "10765", label: "🔮 Sci-Fi & Fantasy" },
  { id: "35", label: "😂 Comedy" },
  { id: "18", label: "🎭 Drama" },
  { id: "9648", label: "🔍 Mystery" },
];

export default async function AnimePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const selectedGenre = params.genre ?? "";
  const isDefaultView = page === 1 && !selectedGenre;

  // Fetch all curated shelves in parallel for maximum performance
  const [trending, shonen, movies, topRated, fantasy, catalog] = await Promise.all([
    getAnime(1).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getAnimeActionShonen(1).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getAnimeMovies(1).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getAnimeTopRated(1).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getAnimeFantasyIsekai(1).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getAnime(page, selectedGenre).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
  ]);

  // Ensure media_type is tv for anime series and movie for anime movies
  const trendingAnimeList = trending.results.map((item) => ({ ...item, media_type: "tv" as const }));
  const shonenAnimeList = shonen.results.map((item) => ({ ...item, media_type: "tv" as const }));
  const movieAnimeList = movies.results.map((item) => ({ ...item, media_type: "movie" as const }));
  const topRatedAnimeList = topRated.results.map((item) => ({ ...item, media_type: "tv" as const }));
  const fantasyAnimeList = fantasy.results.map((item) => ({ ...item, media_type: "tv" as const }));
  const catalogList = catalog.results.map((item) => ({
    ...item,
    media_type: (selectedGenre === "movie" ? "movie" : "tv") as "movie" | "tv",
  }));

  // Hero Spotlight picks top 5 trending with backdrops
  const heroItems = trendingAnimeList.filter((a) => a.backdrop_path).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#06070a] text-white selection:bg-pink-500 selection:text-white">
      {/* Dynamic Anime Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-pink-600/15 via-rose-700/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[40vh] -left-40 w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Anime Spotlight Hero Carousel (Only on default page 1) */}
        {isDefaultView && heroItems.length > 0 && (
          <Hero items={heroItems} isAnime={true} />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
          {/* Header & Quick Genre Filter Chips */}
          <div className={`${!isDefaultView ? "pt-24 sm:pt-28" : "pt-4"}`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  <span>アニメ ポータル • ANIME PORTAL</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Anime Hub
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                  Jelajahi dunia anime terlengkap: Shonen, Isekai, Romance, Supernatural, dan Film Layar Lebar Jepang dengan subtitle Indonesia.
                </p>
              </div>

              {/* Live Count / Status */}
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                  <span className="text-pink-400 font-bold">HD & 4K</span> Quality
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                  <span className="text-pink-400 font-bold">SUB & DUB</span> Multi-Audio
                </span>
              </div>
            </div>

            {/* Genre Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {ANIME_GENRES.map((g) => {
                const isActive = selectedGenre === g.id;
                const href = g.id ? `/anime?genre=${g.id}` : "/anime";
                return (
                  <Link
                    key={g.id || "all"}
                    href={href}
                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white shadow-[0_0_15px_rgba(255,46,147,0.5)] ring-1 ring-pink-400/50"
                        : "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08]"
                    }`}
                  >
                    {g.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Curated Anime Shelves (Shown on default view) */}
          {isDefaultView ? (
            <>
              {/* Shelf 1: Top 10 Anime Hari Ini (Giant Rank Badges) */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-pink-500 font-black text-sm tracking-widest uppercase">
                    RANKING MINGGU INI
                  </span>
                </div>
                <Carousel
                  title="🔥 Top 10 Anime Hari Ini"
                  subtitle="Anime paling banyak ditonton dan trending di komunitas"
                  items={trendingAnimeList}
                  variant="top10"
                />
              </div>

              {/* Shelf 2: Action & Shonen Hits (16:9 Landscape Backdrops) */}
              <div className="relative">
                <Carousel
                  title="⚔️ Action & Shonen Terpopuler"
                  subtitle="Pertarungan epik, kekuatan supernatural, dan perjalanan tanpa batas"
                  items={shonenAnimeList}
                  variant="backdrop"
                />
              </div>

              {/* Shelf 3: Anime Movie Box Office (Theatrical Masterpieces) */}
              <div className="relative">
                <Carousel
                  title="🎬 Box Office Anime Movie"
                  subtitle="Film animasi layar lebar terbaik dari bioskop Jepang"
                  items={movieAnimeList}
                  variant="standard"
                />
              </div>

              {/* Shelf 4: Isekai & Supernatural (16:9 Landscape Backdrops) */}
              <div className="relative">
                <Carousel
                  title="🔮 Isekai & Supernatural"
                  subtitle="Terlempar ke dunia lain dengan sihir dan takdir baru"
                  items={fantasyAnimeList}
                  variant="backdrop"
                />
              </div>

              {/* Shelf 5: Mahakarya Rating Tertinggi */}
              <div className="relative">
                <Carousel
                  title="👑 Mahakarya Anime Sepanjang Masa"
                  subtitle="Serial anime legendaris dengan skor ulasan tertinggi TMDB"
                  items={topRatedAnimeList}
                  variant="standard"
                />
              </div>

              {/* Shelf 6: Full Catalog Grid */}
              <div className="pt-6 border-t border-white/[0.08]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>Katalog Anime Lengkap</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Koleksi ribuan judul anime dari berbagai genre dan musim rilis
                    </p>
                  </div>
                </div>

                <MovieGrid items={catalogList} />

                {/* Pagination */}
                {catalog.total_pages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12">
                    {page > 1 && (
                      <Link
                        href={`/anime?page=${page - 1}`}
                        className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] hover:border-pink-500/50 transition-all cursor-pointer shadow-sm"
                      >
                        &larr; Halaman Sebelumnya
                      </Link>
                    )}
                    <span className="px-4 py-2 text-xs font-semibold text-pink-300 bg-pink-950/40 rounded-full border border-pink-500/30">
                      Hal. {page} dari {Math.min(catalog.total_pages, 500)}
                    </span>
                    {page < catalog.total_pages && page < 500 && (
                      <Link
                        href={`/anime?page=${page + 1}`}
                        className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] hover:border-pink-500/50 transition-all cursor-pointer shadow-sm"
                      >
                        Halaman Berikutnya &rarr;
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Filtered Catalog View (When a genre or page > 1 is active) */
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {ANIME_GENRES.find((g) => g.id === selectedGenre)?.label || "Katalog Anime"}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Ditemukan {catalog.total_results?.toLocaleString("id-ID") || 0} judul anime
                  </p>
                </div>
                {selectedGenre && (
                  <Link
                    href="/anime"
                    className="text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    Reset Filter &rarr;
                  </Link>
                )}
              </div>

              <MovieGrid items={catalogList} />

              {/* Pagination */}
              {catalog.total_pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  {page > 1 && (
                    <Link
                      href={`/anime?${new URLSearchParams({
                        ...(selectedGenre ? { genre: selectedGenre } : {}),
                        page: String(page - 1),
                      }).toString()}`}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] hover:border-pink-500/50 transition-all cursor-pointer shadow-sm"
                    >
                      &larr; Halaman Sebelumnya
                    </Link>
                  )}
                  <span className="px-4 py-2 text-xs font-semibold text-pink-300 bg-pink-950/40 rounded-full border border-pink-500/30">
                    Hal. {page} dari {Math.min(catalog.total_pages, 500)}
                  </span>
                  {page < catalog.total_pages && page < 500 && (
                    <Link
                      href={`/anime?${new URLSearchParams({
                        ...(selectedGenre ? { genre: selectedGenre } : {}),
                        page: String(page + 1),
                      }).toString()}`}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.1] hover:border-pink-500/50 transition-all cursor-pointer shadow-sm"
                    >
                      Halaman Berikutnya &rarr;
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
