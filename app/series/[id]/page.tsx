import { getTVDetail, getTVCredits, getTVRecommendations, getSeasonEpisodes, img, backdrop, displayYear } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import TVPlayer from "@/components/TVPlayer";
import type { Metadata } from "next";

export const revalidate = 86400;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoplay?: string; season?: string; episode?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const show = await getTVDetail(id);
    return {
      title: show.name ?? "Serial",
      description: show.overview?.slice(0, 160),
    };
  } catch {
    return { title: "Serial" };
  }
}

export default async function SeriesDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const showPlayer = sp.autoplay === "1";
  const initialSeason = Number(sp.season ?? 1);
  const initialEpisode = Number(sp.episode ?? 1);

  const [show, credits, recommendations] = await Promise.all([
    getTVDetail(id).catch(() => null),
    getTVCredits(id).catch(() => ({ cast: [], crew: [] })),
    getTVRecommendations(id).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
  ]);

  if (!show) notFound();

  const validSeasons = (show.seasons ?? []).filter((s) => s.season_number > 0);
  const firstSeason = validSeasons[0]?.season_number ?? 1;
  const seasonToLoad = validSeasons.find((s) => s.season_number === initialSeason)
    ? initialSeason
    : firstSeason;

  const initialEpisodes = await getSeasonEpisodes(id, seasonToLoad).catch(() => []);

  const mainCast = credits.cast.slice(0, 12);
  const year = displayYear(show);

  return (
    <article className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Backdrop header */}
      <div className="relative w-full" style={{ height: "420px" }}>
        {show.backdrop_path && (
          <Image
            src={backdrop(show.backdrop_path)}
            alt={`Backdrop ${show.name}`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 backdrop-overlay" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0.5) 60%, rgba(10,10,15,0.1) 100%)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Poster + Info */}
        <div className="flex flex-col sm:flex-row gap-6 -mt-32 relative z-10 mb-10">
          <div className="shrink-0">
            <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{ width: "180px", height: "270px", border: "2px solid var(--border)" }}>
              <Image src={img(show.poster_path, "w342")} alt={`Poster ${show.name}`} fill className="object-cover" priority unoptimized={!show.poster_path} />
            </div>
          </div>

          <div className="flex-1 pt-4 sm:pt-32">
            {show.vote_average > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--accent)" }} aria-hidden><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                <span className="font-semibold" style={{ color: "var(--accent)" }}>{show.vote_average.toFixed(1)}</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>/ 10 ({show.vote_count.toLocaleString("id-ID")} suara)</span>
              </div>
            )}

            <h1 className="font-black leading-tight mb-2" style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)", fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}>
              {show.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
              {year && <span>{year}</span>}
              {show.number_of_seasons && (
                <span style={{ borderLeft: "1px solid var(--border)", paddingLeft: "12px" }}>
                  {show.number_of_seasons} Season
                </span>
              )}
              {show.number_of_episodes && (
                <span style={{ borderLeft: "1px solid var(--border)", paddingLeft: "12px" }}>
                  {show.number_of_episodes} Episode
                </span>
              )}
            </div>

            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {show.genres.map((g) => (
                  <Link key={g.id} href={`/series?genre=${g.id}`}
                    className="text-xs px-2.5 py-1 rounded transition-colors"
                    style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  >{g.name}</Link>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mb-6">
              <Link href={`/series/${id}?autoplay=1`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded font-semibold text-sm transition-colors"
                style={{ background: "var(--accent)", color: "#0a0a0f" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M5 3l14 9-14 9V3z" /></svg>
                Tonton Sekarang
              </Link>
            </div>

            {show.overview && (
              <p className="text-sm leading-relaxed" style={{ color: "rgba(240,238,232,0.8)", maxWidth: "620px" }}>
                {show.overview}
              </p>
            )}
          </div>
        </div>

        {/* TV Player with episode selector */}
        {showPlayer && validSeasons.length > 0 && (
          <div className="mb-10">
            <TVPlayer
              tmdbId={Number(id)}
              seasons={validSeasons}
              initialSeason={seasonToLoad}
              initialEpisode={initialEpisode}
              initialEpisodesMap={{ [seasonToLoad]: initialEpisodes }}
            />
          </div>
        )}

        {/* Cast */}
        {mainCast.length > 0 && (
          <section aria-label="Pemeran" className="mb-10">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)" }}>Pemeran</h2>
            <ul className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }} role="list">
              {mainCast.map((actor) => (
                <li key={actor.id} className="shrink-0 w-24 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-2" style={{ border: "2px solid var(--border)", background: "var(--surface)" }}>
                    <Image src={img(actor.profile_path, "w185")} alt={actor.name} width={80} height={80} className="w-full h-full object-cover" unoptimized={!actor.profile_path} />
                  </div>
                  <p className="text-xs font-medium line-clamp-2 leading-snug" style={{ color: "var(--text)" }}>{actor.name}</p>
                  <p className="text-xs line-clamp-1 mt-0.5" style={{ color: "var(--text-muted)" }}>{actor.character}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {recommendations.results.length > 0 && (
          <section aria-label="Rekomendasi" className="mb-16">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)" }}>Mungkin Kamu Suka</h2>
            <MovieGrid items={recommendations.results.slice(0, 10)} />
          </section>
        )}
      </div>
    </article>
  );
}
