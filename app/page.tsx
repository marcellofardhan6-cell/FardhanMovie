import { getTrending, getPopularMovies, getPopularTV, getAnime, getTopRatedMovies, Movie } from "@/lib/tmdb";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import Link from "next/link";

export const revalidate = 3600;

const EMPTY: Movie[] = [];

export default async function HomePage() {
  const [trending, popularMovies, popularTV, anime, topRated] = await Promise.all([
    getTrending("all", "week").catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getPopularMovies().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getPopularTV().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getAnime().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getTopRatedMovies().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
  ]);

  const hero = trending.results.find((item) => item.backdrop_path) ?? trending.results[0];
  const trendingItems = trending.results.slice(0, 20);

  return (
    <>
      {/* Cinematic Hero */}
      {hero && <Hero item={{ ...hero }} />}

      {/* Main Catalog Carousels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <Carousel
          subtitle="SEDANG POPULER"
          title="Trending Minggu Ini"
          items={trendingItems}
          seeAllHref="/films"
        />

        <Carousel
          subtitle="PILIHAN BIOSKOP"
          title="Film Populer Terbaru"
          items={popularMovies.results}
          seeAllHref="/films"
        />

        {/* Ambient Cinema Highlight Banner */}
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-white/[0.08] bg-gradient-to-r from-[#0c0e17] via-[#141724] to-[#0c0e17] shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-amber-400 mb-2 block">
              PENGALAMAN NONTON PREMIUM
            </span>
            <h3
              className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3 leading-tight"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Koleksi Sinematik Tanpa Iklan &amp; Pop-up
            </h3>
            <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
              Jelajahi ribuan katalog film Hollywood, serial televisi eksklusif, hingga anime terpopuler dengan integrasi multi-server kecepatan tinggi.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/films"
                className="px-6 py-2.5 rounded-full text-xs font-bold text-black transition-transform hover:-translate-y-0.5 shadow-md cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #fce289 0%, #e5a93b 55%, #bd8016 100%)",
                }}
              >
                Eksplorasi Katalog Lengkap
              </Link>
              <Link
                href="/series"
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-zinc-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] transition-all cursor-pointer"
              >
                Lihat Serial TV
              </Link>
            </div>
          </div>
        </div>

        <Carousel
          subtitle="EPISODE &amp; SEASON"
          title="Serial TV Paling Diminati"
          items={popularTV.results}
          seeAllHref="/series"
        />

        <Carousel
          subtitle="JAPANESE ANIMATION"
          title="Koleksi Anime Unggulan"
          items={anime.results}
          seeAllHref="/anime"
        />

        <Carousel
          subtitle="MAHA KARYA SINEMA"
          title="Film Rating Tertinggi Sepanjang Masa"
          items={topRated.results}
          seeAllHref="/films?sort=top_rated"
        />
      </div>
    </>
  );
}
