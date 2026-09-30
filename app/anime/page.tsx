import {
  getAnime,
  getAnimeActionShonen,
  getAnimeMovies,
  getAnimeTopRated,
  getAnimeFantasyIsekai,
  ANIME_GENRE_LIST,
} from "@/lib/tmdb";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import MovieGrid from "@/components/MovieGrid";
import AnimeSchedule from "@/components/AnimeSchedule";
import AnimeGenreExplorer from "@/components/AnimeGenreExplorer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anime - FardTV",
  description: "Nonton serial anime terpopuler, film animasi bioskop Jepang, jelajahi berbagai genre anime lengkap, dan jadwal rilis mingguan dengan subtitle Indonesia di FardTV.",
};

export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ page?: string; genre?: string; sort?: string }>;
}

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Paling Populer" },
  { value: "vote_average.desc", label: "Rating Tertinggi" },
  { value: "first_air_date.desc", label: "Rilis Terbaru" },
];

export default async function AnimePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const selectedGenre = params.genre ?? "";
  const sortBy = params.sort ?? "popularity.desc";
  const isDefaultView = page === 1 && !selectedGenre;

  // Selected genre details from ANIME_GENRE_LIST
  const currentGenreInfo = ANIME_GENRE_LIST.find((g) => g.id === selectedGenre);

  // Fetch all curated shelves in parallel for maximum performance
  const [trending, shonen, movies, topRated, fantasy, catalog] = await Promise.all([
    getAnime(1).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getAnimeActionShonen(1).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getAnimeMovies(1).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getAnimeTopRated(1).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getAnimeFantasyIsekai(1).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getAnime(page, selectedGenre, sortBy).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-14">
        {/* Quick Genre Filter Bar */}
        {isDefaultView ? (
          <div className="pt-1">
            <AnimeGenreExplorer activeGenre={selectedGenre} />
          </div>
        ) : (
          <div className="pt-24 sm:pt-28 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5">
                  <Link href="/" className="hover:text-white transition-colors">Home</Link>
                  <span>/</span>
                  <Link href="/anime" className="hover:text-white transition-colors">Anime</Link>
                  {currentGenreInfo?.name && (
                    <>
                      <span>/</span>
                      <span className="text-[#FF6400] font-bold">{currentGenreInfo.name}</span>
                    </>
                  )}
                </nav>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {currentGenreInfo?.name || "Katalog Anime"}
                </h1>
              </div>

              {selectedGenre && (
                <Link
                  href="/anime"
                  className="self-start sm:self-auto px-4 py-2 rounded-full text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 transition-colors"
                >
                  &larr; Semua Anime
                </Link>
              )}
            </div>

            <AnimeGenreExplorer activeGenre={selectedGenre} />
          </div>
        )}

        {/* Curated Anime Shelves & Interactive Schedule (Shown on default view) */}
        {isDefaultView ? (
          <>
            {/* Shelf 1: Top 10 Anime Hari Ini */}
            <div className="relative">
              <Carousel
                title="Top 10 Anime Hari Ini"
                subtitle="Paling banyak ditonton minggu ini"
                items={trendingAnimeList}
                variant="top10"
              />
            </div>

            {/* Shelf 2: Action & Shonen Hits */}
            <div className="relative">
              <Carousel
                title="Action & Shonen"
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

            {/* Shelf 4: Jadwal Rilis Mingguan */}
            <div className="relative">
              <AnimeSchedule items={trendingAnimeList} />
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
                title="Rating Tertinggi"
                subtitle="Skor ulasan tertinggi dari penonton"
                items={topRatedAnimeList}
                variant="standard"
              />
            </div>

            {/* Shelf 6: Full Catalog Grid */}
            <div className="pt-6 border-t border-zinc-800/80">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Semua Anime
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Katalog lengkap serial dan film animasi Jepang
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
            {/* Filter Bar with Sort Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c0e15] border border-white/[0.08]">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#FF6400]/15 border border-[#FF6400]/30 flex items-center justify-center text-[#FF6400] text-xs font-black font-mono shrink-0">
                  {currentGenreInfo?.jpName || "ALL"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {currentGenreInfo?.name || "Koleksi Anime"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {catalog.total_results?.toLocaleString("id-ID") || 0} judul tersedia
                  </p>
                </div>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <span className="text-xs text-zinc-400 font-semibold mr-1 shrink-0">Urutkan:</span>
                {SORT_OPTIONS.map((opt) => {
                  const isCurrentSort = sortBy === opt.value;
                  const queryParams = new URLSearchParams();
                  if (selectedGenre) queryParams.set("genre", selectedGenre);
                  queryParams.set("sort", opt.value);

                  return (
                    <Link
                      key={opt.value}
                      href={`/anime?${queryParams.toString()}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                        isCurrentSort
                          ? "bg-[#FF6400] text-black font-bold shadow-sm"
                          : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06]"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <MovieGrid items={catalogList} />

            {/* Pagination */}
            {catalog.total_pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                {page > 1 && (
                  <Link
                    href={`/anime?${new URLSearchParams({
                      ...(selectedGenre ? { genre: selectedGenre } : {}),
                      ...(sortBy !== "popularity.desc" ? { sort: sortBy } : {}),
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
                      ...(sortBy !== "popularity.desc" ? { sort: sortBy } : {}),
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
