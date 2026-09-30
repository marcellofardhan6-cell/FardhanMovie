import {
  getAnime,
  getAnimeActionShonen,
  getAnimeMovies,
  getAnimeTopRated,
  getAnimeFantasyIsekai,
} from "@/lib/tmdb";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import MovieGrid from "@/components/MovieGrid";
import AnimeSchedule from "@/components/AnimeSchedule";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime - FardTV",
  description: "Nonton serial anime terpopuler, film animasi bioskop Jepang, dan jadwal rilis mingguan dengan subtitle Indonesia di FardTV.",
};

export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ page?: string; genre?: string }>;
}

const ANIME_GENRES = [
  { id: "", label: "Semua" },
  { id: "10759", label: "Action & Adventure" },
  { id: "10765", label: "Sci-Fi & Fantasi" },
  { id: "35", label: "Komedi" },
  { id: "18", label: "Drama" },
  { id: "9648", label: "Misteri" },
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
    <div className="min-h-screen bg-[#08090d] text-white">
      {/* Anime Spotlight Hero Carousel (Only on default page 1) */}
      {isDefaultView && heroItems.length > 0 && (
        <Hero items={heroItems} isAnime={true} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* Header & Quick Genre Filter Chips */}
        <div className={`${!isDefaultView ? "pt-24 sm:pt-28" : "pt-2"}`}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6400]" />
                <span className="text-xs font-black uppercase tracking-widest text-[#FF6400]">
                  ANIME PORTAL
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Anime Hub
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Koleksi serial animasi Jepang, jadwal rilis mingguan per hari, dan film box office bioskop.
              </p>
            </div>
          </div>

          {/* Crunchyroll-Style Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {ANIME_GENRES.map((g) => {
              const isActive = selectedGenre === g.id;
              const href = g.id ? `/anime?genre=${g.id}` : "/anime";
              return (
                <Link
                  key={g.id || "all"}
                  href={href}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#FF6400] text-black shadow-md shadow-[#FF6400]/25 font-black"
                      : "bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-[#FF6400]/40"
                  }`}
                >
                  {g.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Curated Anime Shelves & Interactive Schedule (Shown on default view) */}
        {isDefaultView ? (
          <>
            {/* Signature Feature: Jadwal Tayang Mingguan (Senin - Minggu) */}
            <div className="relative">
              <AnimeSchedule items={trendingAnimeList} />
            </div>

            {/* Shelf 1: Top 10 Anime Hari Ini */}
            <div className="relative">
              <Carousel
                title="Top 10 Anime Hari Ini"
                subtitle="Paling banyak ditonton minggu ini di komunitas"
                items={trendingAnimeList}
                variant="top10"
              />
            </div>

            {/* Shelf 2: Action & Shonen Hits (16:9 Landscape Backdrops) */}
            <div className="relative">
              <Carousel
                title="Action & Shonen Terpopuler"
                subtitle="Pertarungan epik dan petualangan penuh aksi"
                items={shonenAnimeList}
                variant="backdrop"
              />
            </div>

            {/* Shelf 3: Anime Movie Box Office */}
            <div className="relative">
              <Carousel
                title="Film Layar Lebar Anime"
                subtitle="Animasi terbaik dari bioskop Jepang"
                items={movieAnimeList}
                variant="standard"
              />
            </div>

            {/* Shelf 4: Isekai & Fantasi (16:9 Landscape Backdrops) */}
            <div className="relative">
              <Carousel
                title="Fantasi & Isekai"
                subtitle="Petualangan magis dan dunia paralel"
                items={fantasyAnimeList}
                variant="backdrop"
              />
            </div>

            {/* Shelf 5: Rating Tertinggi */}
            <div className="relative">
              <Carousel
                title="Rating Tertinggi Sepanjang Masa"
                subtitle="Karya anime dengan skor ulasan tertinggi penggemar"
                items={topRatedAnimeList}
                variant="standard"
              />
            </div>

            {/* Shelf 6: Full Catalog Grid */}
            <div className="pt-6 border-t border-zinc-800/80">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Semua Koleksi Anime
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Eksplorasi ribuan judul anime dari berbagai genre dan musim rilis
                </p>
              </div>

              <MovieGrid items={catalogList} />

              {/* Pagination */}
              {catalog.total_pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  {page > 1 && (
                    <Link
                      href={`/anime?page=${page - 1}`}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] hover:border-[#FF6400]/40 transition-all cursor-pointer"
                    >
                      &larr; Halaman Sebelumnya
                    </Link>
                  )}
                  <span className="px-4 py-2 text-xs font-bold text-[#FF6400] bg-[#FF6400]/10 rounded-full border border-[#FF6400]/25">
                    Hal. {page} dari {Math.min(catalog.total_pages, 500)}
                  </span>
                  {page < catalog.total_pages && page < 500 && (
                    <Link
                      href={`/anime?page=${page + 1}`}
                      className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] hover:border-[#FF6400]/40 transition-all cursor-pointer"
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
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {ANIME_GENRES.find((g) => g.id === selectedGenre)?.label || "Katalog Anime"}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {catalog.total_results?.toLocaleString("id-ID") || 0} judul ditemukan
                </p>
              </div>
              {selectedGenre && (
                <Link
                  href="/anime"
                  className="text-xs font-bold text-[#FF6400] hover:underline transition-colors"
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
                    className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] hover:border-[#FF6400]/40 transition-all cursor-pointer"
                  >
                    &larr; Halaman Sebelumnya
                  </Link>
                )}
                <span className="px-4 py-2 text-xs font-bold text-[#FF6400] bg-[#FF6400]/10 rounded-full border border-[#FF6400]/25">
                  Hal. {page} dari {Math.min(catalog.total_pages, 500)}
                </span>
                {page < catalog.total_pages && page < 500 && (
                  <Link
                    href={`/anime?${new URLSearchParams({
                      ...(selectedGenre ? { genre: selectedGenre } : {}),
                      page: String(page + 1),
                    }).toString()}`}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] hover:border-[#FF6400]/40 transition-all cursor-pointer"
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
  );
}
