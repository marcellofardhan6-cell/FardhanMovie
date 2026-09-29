import { getTrending, getPopularMovies, getPopularTV, getAnime, getTopRatedMovies, Movie } from "@/lib/tmdb";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import ContinueWatching from "@/components/ContinueWatching";

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

  return (
    <>
      {/* Dynamic Multi-Slide Hero (Top 5 Spotlight) */}
      <Hero items={trending.results} />

      {/* Content Rows with Rich Visual Rhythm */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 sm:space-y-14">
        {/* Continue Watching shelf */}
        <ContinueWatching />

        {/* 1. Top 10 Row (Netflix-Style Giant Architectural Rank Numbers) */}
        <Carousel
          title="Top 10 Hari Ini"
          items={trending.results}
          variant="top10"
          subtitle="Film dan serial paling banyak ditonton minggu ini"
        />

        {/* 2. Popular Movies (Standard 2:3 Poster Cards) */}
        <Carousel
          title="Popular Movies"
          items={popularMovies.results}
          seeAllHref="/films"
        />

        {/* 3. Top Anime (Cinematic Landscape 16:9 Backdrop Cards) */}
        <Carousel
          title="Anime Pilihan"
          items={anime.results}
          seeAllHref="/anime"
          variant="backdrop"
          subtitle="Animasi Jepang terpopuler dalam format sinematik"
        />

        {/* 4. Popular TV Series (Standard 2:3 Poster Cards) */}
        <Carousel
          title="Popular TV Series"
          items={popularTV.results}
          seeAllHref="/series"
        />

        {/* 5. Top Rated Movies (Standard 2:3 Poster Cards) */}
        <Carousel
          title="Top Rated Movies"
          items={topRated.results}
          seeAllHref="/films?sort=top_rated"
        />
      </div>
    </>
  );
}
