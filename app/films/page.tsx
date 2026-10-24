import { discoverMovies, getMovieGenres } from "@/lib/tmdb";
import InfiniteMovieGrid from "@/components/InfiniteMovieGrid";
import FilterBar from "@/components/FilterBar";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies",
  description:
    "Explore and watch free HD movies online with clean genre filters, latest box office releases, and fast streaming on FardTV.",
  alternates: {
    canonical: "/films",
  },
  openGraph: {
    title: "Movies | FardTV",
    description:
      "Explore and watch free HD movies online with clean genre filters, latest box office releases, and fast streaming on FardTV.",
    url: "https://fardtv.my.id/films",
    siteName: "FardTV",
    type: "website",
  },
};
export const revalidate = 3600;

interface Props {
  searchParams: Promise<{ genre?: string; year?: string; country?: string; sort?: string }>;
}

export default async function FilmsPage({ searchParams }: Props) {
  const params = await searchParams;
  const genre = params.genre;
  const year = params.year;
  const country = params.country;
  const sortParam = params.sort;
  const sort =
    sortParam === "latest"
      ? "primary_release_date.desc"
      : sortParam === "top_rated"
      ? "vote_average.desc"
      : "popularity.desc";

  const fetchPromise = discoverMovies({ genre, year, country, sort_by: sort, page: 1 }).catch(() => ({
    results: [],
    total_pages: 0,
    total_results: 0,
    page: 1,
  }));

  const [data, genres] = await Promise.all([
    fetchPromise,
    getMovieGenres().catch(() => []),
  ]);

  let items = data.results.filter(
    (m) => Boolean(m.poster_path && m.backdrop_path && m.overview && m.overview.trim().length > 15)
  );
  if (sortParam === "latest") {
    items = [...items].sort((a, b) => {
      const dateA = new Date(a.release_date || "1970-01-01").getTime();
      const dateB = new Date(b.release_date || "1970-01-01").getTime();
      return dateB - dateA;
    });
  }

  const catalogParams = {
    type: "movie",
    genre,
    year,
    country,
    sort: sortParam,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Movies
        </h1>
      </div>

      <Suspense>
        <FilterBar
          genres={genres}
          activeGenre={genre}
          activeYear={year}
          activeCountry={country}
          activeSort={sortParam}
          basePath="/films"
        />
      </Suspense>

      <InfiniteMovieGrid
        initialItems={items}
        totalPages={data.total_pages || 1}
        catalogParams={catalogParams}
        emptyTitle="No movies found"
        emptySubtitle="Try adjusting your genre, country, or release year filters."
      />
    </div>
  );
}
