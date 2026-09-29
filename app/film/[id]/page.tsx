import { getMovieDetail, getMovieCredits, getMovieRecommendations, getMovieVideos, findBestTrailer, displayYear } from "@/lib/tmdb";
import Link from "next/link";
import { notFound } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import ServerSwitcher from "@/components/ServerSwitcher";
import DetailCard from "@/components/DetailCard";
import FavoriteButton from "@/components/FavoriteButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetail(id);
    return {
      title: movie.title ?? "Film",
      description: movie.overview?.slice(0, 160),
    };
  } catch {
    return { title: "Film" };
  }
}

export default async function FilmDetailPage({ params }: Props) {
  const { id } = await params;

  const [movie, credits, recommendations, videos] = await Promise.all([
    getMovieDetail(id).catch(() => null),
    getMovieCredits(id).catch(() => ({ cast: [], crew: [] })),
    getMovieRecommendations(id).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getMovieVideos(id).catch(() => []),
  ]);

  if (!movie) notFound();

  const bestTrailer = findBestTrailer(videos);
  const mainCast = credits.cast.slice(0, 15);
  const year = displayYear(movie);
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <article className="min-h-screen bg-[#06070a] text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Breadcrumb & Action Row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/films" className="hover:text-white transition-colors">Movies</Link>
            <span>/</span>
            <span className="text-zinc-200 truncate max-w-xs sm:max-w-md">{movie.title}</span>
          </nav>
          <FavoriteButton item={movie} showText={true} className="px-3 py-1.5 text-xs font-bold shrink-0" />
        </div>

        {/* INSTANT VIDEO PLAYER WITH SERVER SWITCHER & OPTIONAL TRAILER */}
        <div className="mb-8" id="player">
          <ServerSwitcher
            tmdbId={Number(id)}
            type="movie"
            title={movie.title}
            trailerKey={bestTrailer?.key}
            videos={videos}
          />
        </div>

        {/* Clean Detail & Cast Card */}
        <div className="mb-14">
          <DetailCard
            title={movie.title}
            posterPath={movie.poster_path}
            rating={movie.vote_average}
            runtime={runtime}
            year={year}
            genres={movie.genres}
            overview={movie.overview}
            cast={mainCast}
            type="movie"
          />
        </div>

        {/* Recommendations Section */}
        {recommendations.results.length > 0 && (
          <section aria-label="Recommendations" className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
                More Like This
              </h2>
            </div>
            <MovieGrid items={recommendations.results.slice(0, 10)} />
          </section>
        )}
      </div>
    </article>
  );
}
