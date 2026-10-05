import { NextRequest, NextResponse } from "next/server";
import { getMovieDetail, getTVDetail, getMovieCredits, getTVCredits, displayYear } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const [detail, credits] = await Promise.all([
      type === "tv" ? getTVDetail(id) : getMovieDetail(id),
      type === "tv" ? getTVCredits(id) : getMovieCredits(id),
    ]);

    const runtime =
      type === "movie" && detail.runtime
        ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m`
        : detail.number_of_seasons
        ? `${detail.number_of_seasons} Season${detail.number_of_seasons > 1 ? "s" : ""}`
        : null;

    const isAnime =
      Boolean(detail.genres?.some((g) => g.id === 16)) &&
      Boolean(
        detail.origin_country?.includes("JP") ||
        detail.original_language === "ja" ||
        detail.production_countries?.some((c) => c.iso_3166_1 === "JP")
      );

    return NextResponse.json(
      {
        id: detail.id,
        title: detail.title || detail.name || "Untitled",
        poster_path: detail.poster_path,
        backdrop_path: detail.backdrop_path,
        vote_average: detail.vote_average,
        runtime,
        year: displayYear(detail),
        genres: detail.genres || [],
        overview: detail.overview,
        isAnime,
        cast: (credits.cast || []).slice(0, 15).map((c) => ({
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
