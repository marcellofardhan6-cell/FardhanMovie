import { getMovieDetail, getMovieCredits, getMovieRecommendations, img, backdrop, displayYear } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import ServerSwitcher from "@/components/ServerSwitcher";
import type { Metadata } from "next";

export const revalidate = 86400;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoplay?: string }>;
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

export default async function FilmDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const showPlayer = sp.autoplay === "1";

  const [movie, credits, recommendations] = await Promise.all([
    getMovieDetail(id).catch(() => null),
    getMovieCredits(id).catch(() => ({ cast: [], crew: [] })),
    getMovieRecommendations(id).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
  ]);

  if (!movie) notFound();

  const mainCast = credits.cast.slice(0, 12);
  const director = credits.crew.find((c) => c.job === "Director");
  const year = displayYear(movie);
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}j ${movie.runtime % 60}m`
    : null;

  return (
    <article className="min-h-screen bg-[#06070a] text-zinc-100">
      {/* Theatrical Backdrop Header */}
      <div className="relative w-full h-[460px] sm:h-[540px] overflow-hidden">
        {movie.backdrop_path && (
          <Image
            src={backdrop(movie.backdrop_path)}
            alt={`Backdrop ${movie.title}`}
            fill
            priority
            className="object-cover object-top scale-105"
            sizes="100vw"
          />
        )}
        {/* Multi-layered cinematic vignette */}
        <div className="absolute inset-0 backdrop-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06070a] via-[#06070a]/75 to-transparent sm:w-2/3" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06070a]/80 via-transparent to-transparent h-32" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Poster + Overview Hero Row */}
        <div className="flex flex-col sm:flex-row gap-8 -mt-52 sm:-mt-64 relative z-10 mb-12">
          {/* Poster Frame */}
          <div className="shrink-0 mx-auto sm:mx-0">
            <div
              className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/[0.12] bg-[#0d0f15]"
              style={{ width: "210px", height: "315px" }}
            >
              <Image
                src={img(movie.poster_path, "w342")}
                alt={`Poster ${movie.title}`}
                fill
                className="object-cover"
                priority
                unoptimized={!movie.poster_path}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Details & Specs */}
          <div className="flex-1 pt-2 sm:pt-24 text-center sm:text-left">
            {/* Rating pill */}
            {movie.vote_average > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-amber-400/30 backdrop-blur-md mb-3 shadow-[0_0_15px_rgba(229,169,59,0.15)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400" aria-hidden>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-bold text-amber-300 text-sm">{movie.vote_average.toFixed(1)}</span>
                <span className="text-xs text-zinc-400">/ 10 ({movie.vote_count.toLocaleString("id-ID")} rating)</span>
              </div>
            )}

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-2 text-white drop-shadow-lg"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="italic text-sm sm:text-base text-zinc-400 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            {/* Specifications Chips */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-4 text-xs font-medium text-zinc-300">
              {year && (
                <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
                  {year}
                </span>
              )}
              {runtime && (
                <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
                  {runtime}
                </span>
              )}
              {director && (
                <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
                  Sutradara: <strong className="text-white">{director.name}</strong>
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-amber-400 border border-amber-400/30 bg-amber-400/[0.05]">
                4K UHD
              </span>
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
                {movie.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/films?genre=${g.id}`}
                    className="text-xs px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-amber-300 border border-white/[0.08] hover:border-amber-400/30 transition-all"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Primary Action Button */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-6">
              <Link
                href={`/film/${id}?autoplay=1`}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-sm text-[#06070a] transition-all duration-300 transform hover:-translate-y-0.5 shadow-[0_0_35px_rgba(229,169,59,0.35)] hover:shadow-[0_0_50px_rgba(229,169,59,0.55)] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #fce289 0%, #e5a93b 55%, #bd8016 100%)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
                <span>{showPlayer ? "Sedang Memutar" : "Tonton Film Sekarang"}</span>
              </Link>
            </div>

            {/* Overview text */}
            {movie.overview && (
              <div className="max-w-2xl text-left bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
                <h3 className="text-xs font-bold tracking-wider uppercase text-amber-400/90 mb-1.5">
                  Sinopsis
                </h3>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {movie.overview}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Streaming Video Player Window */}
        {showPlayer && (
          <div className="mb-14 scroll-mt-24" id="player">
            <ServerSwitcher tmdbId={Number(id)} type="movie" />
          </div>
        )}

        {/* Cast Section */}
        {mainCast.length > 0 && (
          <section aria-label="Pemeran" className="mb-14">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
                Pemeran Utama
              </h2>
            </div>

            <ul className="flex gap-4 overflow-x-auto pb-4 scroll-snap-x" style={{ scrollbarWidth: "none" }} role="list">
              {mainCast.map((actor) => (
                <li key={actor.id} className="shrink-0 w-28 text-center scroll-snap-item">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-2.5 p-[1px] bg-gradient-to-b from-white/20 to-transparent shadow-lg">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#0d0f15]">
                      <Image
                        src={img(actor.profile_path, "w185")}
                        alt={actor.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        unoptimized={!actor.profile_path}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-bold line-clamp-1 text-zinc-100">{actor.name}</p>
                  <p className="text-[11px] line-clamp-1 text-zinc-400 mt-0.5">{actor.character}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recommendations Section */}
        {recommendations.results.length > 0 && (
          <section aria-label="Rekomendasi" className="mb-20">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
                Film Serupa yang Direkomendasikan
              </h2>
            </div>
            <MovieGrid items={recommendations.results.slice(0, 10)} />
          </section>
        )}
      </div>
    </article>
  );
}
