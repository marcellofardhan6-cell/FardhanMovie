import { getTVDetail, getTVCredits, getTVRecommendations, getTVVideos, findBestTrailer, getSeasonEpisodes, displayYear } from "@/lib/tmdb";
import Link from "next/link";
import { notFound } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import TVPlayer from "@/components/TVPlayer";
import DetailCard from "@/components/DetailCard";
import FavoriteButton from "@/components/FavoriteButton";
import AnimeThemeSync from "@/components/AnimeThemeSync";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const show = await getTVDetail(id);
    return {
      title: show.name ?? "Series",
      description: show.overview?.slice(0, 160),
    };
  } catch {
    return { title: "Series" };
  }
}

export default async function SeriesDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const initialSeason = Number(sp.season ?? 1);
  const initialEpisode = Number(sp.episode ?? 1);

  const [show, credits, recommendations, videos] = await Promise.all([
    getTVDetail(id).catch(() => null),
    getTVCredits(id).catch(() => ({ cast: [], crew: [] })),
    getTVRecommendations(id).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
    getTVVideos(id).catch(() => []),
  ]);

  if (!show) notFound();

  const isAnime =
    Boolean(show.genres?.some((g: any) => g.id === 16)) &&
    Boolean(
      show.origin_country?.includes("JP") ||
      show.original_language === "ja" ||
      show.production_countries?.some((c) => c.iso_3166_1 === "JP")
    );

  const bestTrailer = findBestTrailer(videos);
  const validSeasons = (show.seasons ?? []).filter((s) => s.season_number > 0);
  const firstSeason = validSeasons[0]?.season_number ?? 1;
  const seasonToLoad = validSeasons.find((s) => s.season_number === initialSeason)
    ? initialSeason
    : firstSeason;

  const initialEpisodes = await getSeasonEpisodes(id, seasonToLoad).catch(() => []);

  const mainCast = credits.cast.slice(0, 15);
  const year = displayYear(show);
  const seasonInfo = show.number_of_seasons
    ? `${show.number_of_seasons} Season${show.number_of_seasons > 1 ? "s" : ""}`
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
              href={isAnime ? "/anime" : "/series"}
              className={`transition-colors ${isAnime ? "text-[#FF6400] font-bold hover:text-[#ff7b1a]" : "hover:text-white"}`}
            >
              {isAnime ? "Anime" : "TV Series"}
            </Link>
            <span>/</span>
            <span className="text-zinc-200 truncate max-w-xs sm:max-w-md">{show.name}</span>
          </nav>
          <FavoriteButton item={show} showText={true} className="px-3 py-1.5 text-xs font-bold shrink-0" />
        </div>

        {/* INSTANT TV STREAMING PLAYER + EPISODE SELECTOR */}
        {validSeasons.length > 0 && (
          <div className="mb-8" id="player">
            <TVPlayer
              tmdbId={Number(id)}
              seasons={validSeasons}
              initialSeason={seasonToLoad}
              initialEpisode={initialEpisode}
              initialEpisodesMap={{ [seasonToLoad]: initialEpisodes }}
              title={show.name}
              trailerKey={bestTrailer?.key}
              posterPath={show.poster_path}
              backdropPath={show.backdrop_path}
            />
          </div>
        )}

        {/* Clean Detail & Cast Card */}
        <div className="mb-14">
          <DetailCard
            title={show.name}
            posterPath={show.poster_path}
            rating={show.vote_average}
            runtime={seasonInfo}
            year={year}
            genres={show.genres}
            overview={show.overview}
            cast={mainCast}
            type="tv"
            isAnime={isAnime}
          />
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
