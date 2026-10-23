import { NextRequest, NextResponse } from "next/server";
import {
  discoverMovies,
  discoverTV,
  getAnime,
  getNowPlaying,
  searchMulti,
  Movie,
} from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "movie";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const genre = searchParams.get("genre") || undefined;
  const year = searchParams.get("year") || undefined;
  const country = searchParams.get("country") || undefined;
  const sort = searchParams.get("sort") || undefined;
  const q = searchParams.get("q") || undefined;

  try {
    let items: Movie[] = [];
    let totalPages = 1;

    if (type === "search" && q) {
      const data = await searchMulti(q, page).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 }));
      items = (data.results || []).filter(
        (item) => item.poster_path && (item.media_type === "movie" || item.media_type === "tv")
      );
      totalPages = data.total_pages || 1;
    } else if (type === "anime") {
      const data = await getAnime(page, genre, sort).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 }));
      items = (data.results || []).filter((m) => Boolean(m.poster_path));
      totalPages = data.total_pages || 1;
    } else if (type === "country") {
      const countryCode = country === "ALL" ? undefined : country;
      const mode = searchParams.get("mode") || "all";
      const movieSort =
        sort === "top_rated"
          ? "vote_average.desc"
          : sort === "latest"
          ? "primary_release_date.desc"
          : "popularity.desc";
      const tvSort =
        sort === "top_rated"
          ? "vote_average.desc"
          : sort === "latest"
          ? "first_air_date.desc"
          : "popularity.desc";

      const [moviesData, tvData] = await Promise.all([
        mode === "tv"
          ? Promise.resolve({ results: [] as Movie[], total_pages: 0, total_results: 0, page: 1 })
          : discoverMovies({ genre, year, country: countryCode, sort_by: movieSort, page }).catch(() => ({
              results: [] as Movie[],
              total_pages: 0,
              total_results: 0,
              page: 1,
            })),
        mode === "movie"
          ? Promise.resolve({ results: [] as Movie[], total_pages: 0, total_results: 0, page: 1 })
          : discoverTV({ genre, year, country: countryCode, sort_by: tvSort, page }).catch(() => ({
              results: [] as Movie[],
              total_pages: 0,
              total_results: 0,
              page: 1,
            })),
      ]);

      if (mode === "movie") {
        items = moviesData.results.filter((m) => Boolean(m.poster_path)).map((m) => ({ ...m, media_type: "movie" }));
        totalPages = moviesData.total_pages;
      } else if (mode === "tv") {
        items = tvData.results.filter((t) => Boolean(t.poster_path)).map((t) => ({ ...t, media_type: "tv" }));
        totalPages = tvData.total_pages;
      } else {
        const mResults = moviesData.results.filter((m) => Boolean(m.poster_path)).map((m) => ({ ...m, media_type: "movie" }));
        const tResults = tvData.results.filter((t) => Boolean(t.poster_path)).map((t) => ({ ...t, media_type: "tv" }));
        const maxLength = Math.max(mResults.length, tResults.length);
        const combined: Movie[] = [];
        for (let i = 0; i < maxLength; i++) {
          if (mResults[i]) combined.push(mResults[i]);
          if (tResults[i]) combined.push(tResults[i]);
        }
        items = combined;
        totalPages = Math.max(moviesData.total_pages, tvData.total_pages);
      }
    } else if (type === "tv") {
      const sortParam =
        sort === "top_rated"
          ? "vote_average.desc"
          : sort === "latest"
          ? "first_air_date.desc"
          : "popularity.desc";
      const data = await discoverTV({ genre, year, country, sort_by: sortParam, page }).catch(() => ({
        results: [] as Movie[],
        total_pages: 0,
        total_results: 0,
        page: 1,
      }));
      items = (data.results || []).filter((m) => Boolean(m.poster_path));
      totalPages = data.total_pages || 1;
    } else {
      // Movie
      if (sort === "now_playing") {
        const data = await getNowPlaying(page).catch(() => ({ results: [] as Movie[], total_pages: 0, total_results: 0, page: 1 }));
        items = (data.results || []).filter((m) => Boolean(m.poster_path));
        totalPages = data.total_pages || 1;
      } else {
        const sortParam =
          sort === "top_rated"
            ? "vote_average.desc"
            : sort === "latest"
            ? "primary_release_date.desc"
            : "popularity.desc";
        const data = await discoverMovies({ genre, year, country, sort_by: sortParam, page }).catch(() => ({
          results: [] as Movie[],
          total_pages: 0,
          total_results: 0,
          page: 1,
        }));
        items = (data.results || []).filter((m) => Boolean(m.poster_path));
        totalPages = data.total_pages || 1;
      }
    }

    return NextResponse.json(
      {
        items,
        totalPages: Math.min(totalPages, 500),
        page,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=900",
        },
      }
    );
  } catch {
    return NextResponse.json({ items: [], totalPages: 1, page }, { status: 500 });
  }
}
