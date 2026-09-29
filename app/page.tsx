import { getTrending, getPopularMovies, getPopularTV, getAnime, getTopRatedMovies, Movie } from "@/lib/tmdb";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";

export const revalidate = 3600;

const EMPTY: Movie[] = [];

export default async function HomePage() {
  // Halaman tetap render walau TMDB gagal (mis. env belum diset saat build)
  const [trending, popularMovies, popularTV, anime, topRated] = await Promise.all([
    getTrending("all", "week").catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getPopularMovies().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getPopularTV().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getAnime().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getTopRatedMovies().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
  ]);

  const hero = trending.results.find((item) => item.backdrop_path) ?? trending.results[0];
  // Add media_type to trending items so cards know the route
  const trendingItems = trending.results.slice(0, 20);

  return (
    <>
      {/* Hero */}
      {hero && <Hero item={{ ...hero }} />}

      {/* Carousels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <Carousel
          title="Trending Minggu Ini"
          items={trendingItems}
          seeAllHref="/films"
        />
        <Carousel
          title="Film Populer"
          items={popularMovies.results}
          seeAllHref="/films"
        />
        <Carousel
          title="Serial TV Populer"
          items={popularTV.results}
          seeAllHref="/series"
        />
        <Carousel
          title="Anime Terpopuler"
          items={anime.results}
          seeAllHref="/anime"
        />
        <Carousel
          title="Film Rating Tertinggi"
          items={topRated.results}
          seeAllHref="/films?sort=top_rated"
        />
      </div>
    </>
  );
}
