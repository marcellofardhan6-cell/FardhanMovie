import { getTVDetail, getTVCredits, getTVRecommendations, getSeasonEpisodes, img, displayYear } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import TVPlayer from "@/components/TVPlayer";
import type { Metadata } from "next";

export const revalidate = 86400;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
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
    <article className="min-h-screen bg-[#06070a] text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Breadcrumb & Series Header */}
        <div className="mb-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/series" className="hover:text-white transition-colors">Serial TV</Link>
            <span>/</span>
            <span className="text-zinc-200 truncate max-w-xs sm:max-w-none">{show.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {show.name}
              </h1>
            </div>

            {/* Rating Badge */}
            {show.vote_average > 0 && (
              <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-amber-400/30 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400" aria-hidden>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-bold text-amber-300">{show.vote_average.toFixed(1)}</span>
                <span className="text-[11px] text-zinc-400">/ 10 ({show.vote_count.toLocaleString("id-ID")})</span>
              </div>
            )}
          </div>

          {/* Specifications Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs text-zinc-300">
            {year && (
              <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
                {year}
              </span>
            )}
            {show.number_of_seasons && (
              <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
                {show.number_of_seasons} Season
              </span>
            )}
            {show.number_of_episodes && (
              <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
                {show.number_of_episodes} Episode
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-amber-400/30 bg-amber-400/[0.05]">
              SERIAL LENGKAP
            </span>
            {show.genres?.map((g) => (
              <Link
                key={g.id}
                href={`/series?genre=${g.id}`}
                className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-amber-300 border border-white/[0.08] transition-colors"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>

        {/* INSTANT TV STREAMING PLAYER + EPISODE SELECTOR */}
        {validSeasons.length > 0 && (
          <div className="mb-12" id="player">
            <TVPlayer
              tmdbId={Number(id)}
              seasons={validSeasons}
              initialSeason={seasonToLoad}
              initialEpisode={initialEpisode}
              initialEpisodesMap={{ [seasonToLoad]: initialEpisodes }}
            />
          </div>
        )}

        {/* Synopsis & Details Row */}
        <div className="flex flex-col md:flex-row gap-8 mb-14 p-6 rounded-2xl bg-[#0c0e15] border border-white/[0.08]">
          {/* Poster Thumbnail */}
          <div className="shrink-0 mx-auto md:mx-0">
            <div
              className="relative rounded-xl overflow-hidden shadow-xl border border-white/[0.1] bg-[#0d0f15]"
              style={{ width: "160px", height: "240px" }}
            >
              <Image
                src={img(show.poster_path, "w342")}
                alt={`Poster ${show.name}`}
                fill
                className="object-cover"
                unoptimized={!show.poster_path}
              />
            </div>
          </div>

          {/* Synopsis & Metadata */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              Sinopsis Serial
            </h2>
            <p className="text-sm leading-relaxed text-zinc-300 mb-4">
              {show.overview || "Sinopsis belum tersedia untuk serial ini."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/[0.06] text-xs">
              <div>
                <span className="text-zinc-400">Total Season: </span>
                <span className="text-white font-medium">{show.number_of_seasons || validSeasons.length} Season</span>
              </div>
              <div>
                <span className="text-zinc-400">Total Episode: </span>
                <span className="text-white font-medium">{show.number_of_episodes || "-"} Episode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {mainCast.length > 0 && (
          <section aria-label="Pemeran" className="mb-14">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
                Pemeran Serial
              </h2>
            </div>

            <ul className="flex gap-4 overflow-x-auto pb-4 scroll-snap-x" style={{ scrollbarWidth: "none" }} role="list">
              {mainCast.map((actor) => (
                <li key={actor.id} className="shrink-0 w-24 text-center scroll-snap-item">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 p-[1px] bg-gradient-to-b from-white/20 to-transparent">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#0d0f15]">
                      <Image
                        src={img(actor.profile_path, "w185")}
                        alt={actor.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized={!actor.profile_path}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-bold line-clamp-1 text-zinc-100">{actor.name}</p>
                  <p className="text-[10px] line-clamp-1 text-zinc-400 mt-0.5">{actor.character}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recommendations Section */}
        {recommendations.results.length > 0 && (
          <section aria-label="Rekomendasi" className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
                Serial Serupa yang Direkomendasikan
              </h2>
            </div>
            <MovieGrid items={recommendations.results.slice(0, 10)} />
          </section>
        )}
      </div>
    </article>
  );
}
