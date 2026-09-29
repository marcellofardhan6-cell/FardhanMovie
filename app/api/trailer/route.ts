import { NextRequest, NextResponse } from "next/server";
import { getMovieVideos, getTVVideos, findBestTrailer } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type") === "tv" ? "tv" : "movie";

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    const videos = type === "tv" ? await getTVVideos(id) : await getMovieVideos(id);
    const trailer = findBestTrailer(videos);

    if (!trailer) {
      return NextResponse.json({ trailer: null });
    }

    return NextResponse.json(
      {
        trailer: {
          key: trailer.key,
          name: trailer.name,
          site: trailer.site,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch trailer:", error);
    return NextResponse.json({ error: "Failed to fetch trailer" }, { status: 500 });
  }
}
