import { getMovieDetail, getMovieCredits, getMovieRecommendations, getMovieVideos, findBestTrailer, displayYear } from "@/lib/tmdb";
import Link from "next/link";
import { notFound } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import ServerSwitcher from "@/components/ServerSwitcher";
import FavoriteButton from "@/components/FavoriteButton";
import AnimeThemeSync from "@/components/AnimeThemeSync";
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
      title: movie.title ?? "Movie",
      description: movie.overview?.slice(0, 160),
    };
  } catch {
    return { title: "Movie" };
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

  const isAnime =
    Boolean(movie.genres?.some((g: any) => g.id === 16)) &&
    Boolean(
      movie.origin_country?.includes("JP") ||
      movie.original_language === "ja" ||
      movie.production_countries?.some((c) => c.iso_3166_1 === "JP")
    );

  const bestTrailer = findBestTrailer(videos);
  const mainCast = credits.cast.slice(0, 15);
  const year = displayYear(movie);
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <article className="min-h-screen bg-[#06070a] text-zinc-100">
      <AnimeThemeSync isAnime={isAnime} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-24 pb-20">
        {/* Breadcrumb & Action Row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link
              href={isAnime ? "/anime" : "/films"}
              className={`transition-colors ${isAnime ? "text-[#FF6400] font-bold hover:text-[#ff7b1a]" : "hover:text-white"}`}
            >
              {isAnime ? "Anime" : "Movies"}
            </Link>
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
            posterPath={movie.poster_path}
            backdropPath={movie.backdrop_path}
            runtimeMinutes={movie.runtime}
          />
        </div>

        {/* Netflix-style Overview & Details */}
        <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-[#12141c] border border-white/[0.08]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column: Metadata & Synopsis */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold">
                <span className="text-[#46d369] font-bold">98% Cocok</span>
                {year && <span className="text-zinc-300">{year}</span>}
                <span className="border border-white/40 px-1.5 py-0.2 rounded text-[10px] text-zinc-300 uppercase">
                  16+
                </span>
                {runtime && <span className="text-zinc-300">{runtime}</span>}
                <span className="border border-white/40 px-1 py-0.2 rounded text-[9px] text-zinc-300 font-bold uppercase">
                  Ultra HD 4K
                </span>
                <span className="border border-white/40 px-1 py-0.2 rounded text-[9px] text-zinc-300 font-bold uppercase">
                  CC
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {movie.title}
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                {movie.overview || "Sinopsis belum tersedia."}
              </p>
            </div>

            {/* Right Column: Cast & Genres */}
            <div className="space-y-3.5 text-xs sm:text-sm text-zinc-400 border-t md:border-t-0 md:border-l border-white/[0.08] pt-4 md:pt-0 md:pl-6">
              {mainCast.length > 0 && (
                <div>
                  <span className="text-zinc-500 font-normal">Pemeran: </span>
                  <span className="text-white font-medium">
                    {mainCast.slice(0, 4).map((c) => c.name).join(", ")}
                  </span>
                </div>
              )}

              {movie.genres && movie.genres.length > 0 && (
                <div>
                  <span className="text-zinc-500 font-normal">Genre: </span>
                  <span className="text-white font-medium">
                    {movie.genres.map((g: any) => g.name).join(", ")}
                  </span>
                </div>
              )}

              <div>
                <span className="text-zinc-500 font-normal">Kualitas: </span>
                <span className="text-white font-medium">1080p Full HD • Multi Subtitle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.results.length > 0 && (
          <section aria-label="Recommendations" className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-1.5 h-1.5 rounded-full ${isAnime ? "bg-[#FF6400]" : "bg-red-600"}`} />
              <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
                {isAnime ? "More Anime Like This" : "More Like This"}
              </h2>
            </div>
            <MovieGrid items={recommendations.results.slice(0, 10)} />
          </section>
        )}
      </div>
    </article>
  );
}
