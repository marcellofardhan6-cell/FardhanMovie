import { NextResponse } from "next/server";
import { searchMulti } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await searchMulti(q, 1);
    const filtered = (data.results || [])
      .filter(
        (item) =>
          (item.media_type === "movie" || item.media_type === "tv") &&
          Boolean(item.poster_path)
      )
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        title: item.title || item.name || "Untitled",
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        media_type: item.media_type === "tv" ? "tv" : "movie",
        release_date: item.release_date || item.first_air_date || "",
        vote_average: item.vote_average ?? 0,
      }));

    return NextResponse.json({ results: filtered });
  } catch (error) {
    console.error("Live search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
