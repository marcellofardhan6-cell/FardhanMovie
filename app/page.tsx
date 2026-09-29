import { getTrending, getPopularMovies, getPopularTV, getAnime, getTopRatedMovies, Movie } from "@/lib/tmdb";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";

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
      {/* Streaming Hero */}
      {hero && <Hero item={{ ...hero }} />}

      {/* Movie & Series Rows (Clean streaming platform experience) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-7 sm:space-y-12">
        <Carousel
          title="Trending This Week"
          items={trendingItems}
          seeAllHref="/films"
        />

        <Carousel
          title="Popular Movies"
          items={popularMovies.results}
          seeAllHref="/films"
        />

        <Carousel
          title="Popular TV Series"
          items={popularTV.results}
          seeAllHref="/series"
        />

        <Carousel
          title="Top Anime"
          items={anime.results}
          seeAllHref="/anime"
        />

        <Carousel
          title="Top Rated Movies"
          items={topRated.results}
          seeAllHref="/films?sort=top_rated"
        />
      </div>
    </>
  );
}
