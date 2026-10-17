import { NextRequest, NextResponse } from "next/server";
import { getSeasonEpisodes } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const season = parseInt(searchParams.get("season") || "1", 10) || 1;

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const episodes = await getSeasonEpisodes(id, season);
    return NextResponse.json(
      {
        episodes: (episodes || []).map((ep: any) => ({
          id: ep.id,
          episode_number: ep.episode_number,
          name: ep.name,
          overview: ep.overview,
          still_path: ep.still_path,
          runtime: ep.runtime,
          air_date: ep.air_date,
        })),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch season episodes:", error);
    return NextResponse.json({ episodes: [] });
  }
}
