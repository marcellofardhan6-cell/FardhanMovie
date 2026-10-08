import {
  getTrending,
  getPopularMovies,
  getPopularTV,
  getAnime,
  getTopRatedMovies,
  getLatestUploads,
  Movie,
} from "@/lib/tmdb";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import ContinueWatching from "@/components/ContinueWatching";
import LatestUploads from "@/components/LatestUploads";

export const revalidate = 3600;

const EMPTY: Movie[] = [];

export default async function HomePage() {
  const [
    trending,
    popularMovies,
    popularTV,
    anime,
    topRated,
    latestMovies,
    latestTV,
  ] = await Promise.all([
    getTrending("all", "week").catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getPopularMovies().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getPopularTV().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getAnime().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getTopRatedMovies().catch(() => ({ results: EMPTY, total_pages: 0, total_results: 0, page: 1 })),
    getLatestUploads({ type: "movie" }).catch(() => EMPTY),
    getLatestUploads({ type: "tv" }).catch(() => EMPTY),
  ]);

  const trendingList = trending.results.filter((m) => Boolean(m.poster_path));
  const popularMoviesList = popularMovies.results.filter((m) => Boolean(m.poster_path));
  const popularTVList = popularTV.results.filter((m) => Boolean(m.poster_path));
  const animeList = anime.results.filter((m) => Boolean(m.poster_path || m.backdrop_path));
  const topRatedList = topRated.results.filter((m) => Boolean(m.poster_path));

  const latestAll = [...latestMovies, ...latestTV].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || "";
    const dateB = b.release_date || b.first_air_date || "";
    return dateB.localeCompare(dateA);
  });

  return (
    <>
      {/* Dynamic Multi-Slide Hero (Top 5 Spotlight) */}
      <Hero items={trendingList} />

      {/* Content Rows with Rich Visual Rhythm */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 sm:space-y-14">
        {/* Continue Watching shelf */}
        <ContinueWatching />

        {/* 1. Top 10 Row (Netflix-Style Giant Architectural Rank Numbers) */}
        <Carousel
          title="Top 10 Today"
          items={trendingList}
          variant="top10"
          subtitle="Most watched movies and series this week"
        />

        {/* 2. Popular Movies (Standard 2:3 Poster Cards) */}
        <Carousel
          title="Popular Movies"
          items={popularMoviesList}
          seeAllHref="/films"
        />

        {/* 3. Top Anime (Cinematic Landscape 16:9 Backdrop Cards) */}
        <Carousel
          title="Featured Anime"
          items={animeList}
          seeAllHref="/anime"
          variant="backdrop"
          subtitle="Top Japanese animation in cinematic format"
        />

        {/* 4. Popular TV Series (Standard 2:3 Poster Cards) */}
        <Carousel
          title="Popular TV Series"
          items={popularTVList}
          seeAllHref="/series"
        />

        {/* 5. Top Rated Movies (Standard 2:3 Poster Cards) */}
        <Carousel
          title="Top Rated Movies"
          items={topRatedList}
          seeAllHref="/films?sort=top_rated"
        />

        {/* 6. Upload Terbaru (Ngefilm21-style section with anti-AI quality filters) */}
        <LatestUploads
          initialAll={latestAll}
          initialMovies={latestMovies}
          initialTV={latestTV}
        />
      </div>
    </>
  );
}
