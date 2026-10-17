import { NextRequest, NextResponse } from "next/server";
import {
  getMovieDetail,
  getTVDetail,
  getMovieCredits,
  getTVCredits,
  getMovieRecommendations,
  getTVRecommendations,
  getSeasonEpisodes,
  displayYear,
  Genre,
} from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";
  const requestedSeason = parseInt(searchParams.get("season") || "1", 10) || 1;

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const [detail, credits, recs, episodes]: [any, any, any, any] = await Promise.all([
      type === "tv" ? getTVDetail(id) : getMovieDetail(id),
      type === "tv" ? getTVCredits(id) : getMovieCredits(id),
      (type === "tv" ? getTVRecommendations(id) : getMovieRecommendations(id)).catch(() => ({ results: [] })),
      type === "tv" ? getSeasonEpisodes(id, requestedSeason).catch(() => []) : Promise.resolve([]),
    ]);

    const runtime =
      type === "movie" && detail.runtime
        ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m`
        : detail.number_of_seasons
        ? `${detail.number_of_seasons} Season${detail.number_of_seasons > 1 ? "s" : ""}`
        : null;

    const isAnime =
      Boolean(detail.genres?.some((g: Genre) => g.id === 16)) &&
      Boolean(
        detail.origin_country?.includes("JP") ||
        detail.original_language === "ja" ||
        detail.production_countries?.some((c: { iso_3166_1?: string }) => c.iso_3166_1 === "JP")
      );

    return NextResponse.json(
      {
        id: detail.id,
        title: detail.title || detail.name || "Untitled",
        tagline: detail.tagline || null,
        poster_path: detail.poster_path,
        backdrop_path: detail.backdrop_path,
        vote_average: detail.vote_average,
        runtime,
        year: displayYear(detail),
        genres: detail.genres || [],
        overview: detail.overview,
        isAnime,
        seasons: detail.seasons || [],
        episodes: (episodes || []).map((ep: any) => ({
          id: ep.id,
          episode_number: ep.episode_number,
          name: ep.name,
          overview: ep.overview,
          still_path: ep.still_path,
          runtime: ep.runtime,
          air_date: ep.air_date,
        })),
        recommendations: (recs.results || []).slice(0, 6),
        cast: (credits.cast || []).slice(0, 15).map((c: any) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profile_path: c.profile_path,
        })),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch detail:", error);
    return NextResponse.json({ error: "Failed to fetch detail" }, { status: 500 });
  }
}
