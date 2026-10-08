const TMDB_BASE = "https://api.themoviedb.org/3";
const TOKEN = process.env.TMDB_READ_ACCESS_TOKEN!;
/** TMDB kadang lelet dari jaringan Indonesia — abort cepat biar UI gak nunggu lama */
const FETCH_TIMEOUT_MS = 8000;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function tmdbGet(url: string): Promise<Response> {
  if (!TOKEN) {
    throw new Error("TMDB_READ_ACCESS_TOKEN belum diset di environment variables");
  }
  return fetch(url, {
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    next: { revalidate: 3600 },
  });
}

async function tmdbFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("language", "en-US");
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  let res: Response;
  try {
    res = await tmdbGet(url.toString());
  } catch {
    // Timeout / network error: coba sekali lagi sebelum menyerah
    res = await tmdbGet(url.toString());
  }

  if (!res.ok) {
    // Fallback to en-US if id-ID returns error
    url.searchParams.set("language", "en-US");
    const fallback = await tmdbGet(url.toString());
    if (!fallback.ok) throw new Error(`TMDB error: ${res.status} ${path}`);
    return fallback.json();
  }

  const data = await res.json();

  // Jika overview kosong (id-ID belum ada terjemahan), ambil en-US.
  // Cek hanya untuk response detail (punya field overview string).
  if (typeof data?.overview === "string" && data.overview === "") {
    url.searchParams.set("language", "en-US");
    try {
      const fallback = await tmdbGet(url.toString());
      if (fallback.ok) {
        const fallbackData = await fallback.json();
        return { ...data, overview: fallbackData.overview } as T;
      }
    } catch {
      // fallback gagal — pakai data id-ID apa adanya
    }
  }

  return data;
}

// ---- Types ----
export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  logo_path?: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  media_type?: string;
  imdb_id?: string;
  origin_country?: string[];
  original_language?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  runtime: number | null;
}

export interface TMDBResponse<T> {
  results: T[];
  total_pages: number;
  total_results: number;
  page: number;
}

export interface MovieDetail extends Movie {
  genres: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Season[];
  imdb_id?: string;
  tagline?: string;
  status?: string;
  production_countries?: { iso_3166_1: string; name: string }[];
  production_companies?: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  spoken_languages?: { english_name: string; iso_639_1: string; name: string }[];
  original_language?: string;
  budget?: number;
  revenue?: number;
  created_by?: { id: number; name: string; profile_path: string | null }[];
  networks?: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  last_air_date?: string;
}

export interface CreditsResponse {
  cast: Cast[];
  crew: { id: number; name: string; job: string; profile_path: string | null }[];
}

// ---- API Functions ----

export async function getTrending(type: "all" | "movie" | "tv" = "all", timeWindow: "day" | "week" = "week") {
  return tmdbFetch<TMDBResponse<Movie>>(`/trending/${type}/${timeWindow}`);
}

export async function getPopularMovies(page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>("/movie/popular", { page: String(page) });
}

export async function getPopularTV(page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>("/tv/popular", { page: String(page) });
}

export async function getTopRatedMovies(page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>("/movie/top_rated", { page: String(page) });
}

export async function getTopRatedTV(page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>("/tv/top_rated", { page: String(page) });
}

export interface AnimeGenreInfo {
  id: string;
  name: string;
  jpName: string;
  description: string;
}

export const ANIME_GENRE_LIST: AnimeGenreInfo[] = [
  { id: "", name: "All", jpName: "ALL", description: "Complete collection of Japanese anime" },
  { id: "10759", name: "Action & Shonen", jpName: "ACTION", description: "Epic battles, shonen rivals, and thrilling adventures" },
  { id: "10765", name: "Sci-Fi & Fantasy", jpName: "FANTASY", description: "Isekai, magic spells, parallel worlds, and futuristic sci-fi" },
  { id: "35", name: "Comedy", jpName: "COMEDY", description: "Hilarious gags, witty parodies, and lighthearted laughs" },
  { id: "18", name: "Drama & Romance", jpName: "ROMANCE", description: "Heartfelt love stories, school romance, and emotional journeys" },
  { id: "9648", name: "Mystery & Detective", jpName: "MYSTERY", description: "Crime puzzles, gripping investigations, and deep plot twists" },
  { id: "10751", name: "Slice of Life", jpName: "SLICE OF LIFE", description: "Cozy everyday life, school clubs, and warm friendships" },
  { id: "80", name: "Psychological & Crime", jpName: "PSYCHOLOGICAL", description: "Mind games, psychological thrillers, and dark criminal intrigue" },
  { id: "10768", name: "War & Mecha", jpName: "MECHA", description: "Large-scale wars, giant mecha robots, and tactical conflicts" },
  { id: "10762", name: "Kids & Shonen", jpName: "SHONEN", description: "Never-give-up spirit, martial arts tournaments, and friendship" },
  { id: "movie", name: "Theatrical Films", jpName: "THEATRICAL", description: "Acclaimed feature-length anime with cinematic animation" },
];

export async function getAnime(
  page = 1,
  genre?: string,
  sortBy: string = "popularity.desc"
) {
  if (genre === "movie") {
    return tmdbFetch<TMDBResponse<Movie>>("/discover/movie", {
      with_genres: "16",
      with_origin_country: "JP",
      sort_by: sortBy,
      page: String(page),
    });
  }

  const params: Record<string, string> = {
    with_genres: genre ? `16,${genre}` : "16",
    with_origin_country: "JP",
    sort_by: sortBy,
    page: String(page),
  };
  return tmdbFetch<TMDBResponse<Movie>>("/discover/tv", params);
}

export async function getAnimeActionShonen(page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>("/discover/tv", {
    with_genres: "16,10759",
    with_origin_country: "JP",
    sort_by: "popularity.desc",
    page: String(page),
  });
}

export async function getAnimeMovies(page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>("/discover/movie", {
    with_genres: "16",
    with_origin_country: "JP",
    sort_by: "popularity.desc",
    page: String(page),
  });
}

export async function getAnimeTopRated(page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>("/discover/tv", {
    with_genres: "16",
    with_origin_country: "JP",
    sort_by: "vote_average.desc",
    "vote_count.gte": "250",
    page: String(page),
  });
}

export async function getAnimeFantasyIsekai(page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>("/discover/tv", {
    with_genres: "16,10765",
    with_origin_country: "JP",
    sort_by: "popularity.desc",
    page: String(page),
  });
}

export async function getMovieDetail(id: string) {
  return tmdbFetch<MovieDetail>(`/movie/${id}`);
}

export async function getTVDetail(id: string) {
  return tmdbFetch<MovieDetail>(`/tv/${id}`);
}

export async function getMovieCredits(id: string) {
  return tmdbFetch<CreditsResponse>(`/movie/${id}/credits`);
}

export async function getTVCredits(id: string) {
  return tmdbFetch<CreditsResponse>(`/tv/${id}/credits`);
}

export async function getMovieRecommendations(id: string) {
  return tmdbFetch<TMDBResponse<Movie>>(`/movie/${id}/recommendations`);
}

export async function getTVRecommendations(id: string) {
  return tmdbFetch<TMDBResponse<Movie>>(`/tv/${id}/recommendations`);
}

export async function getSeasonEpisodes(tvId: string, season: number) {
  const data = await tmdbFetch<{ episodes: Episode[] }>(`/tv/${tvId}/season/${season}`);
  return data.episodes;
}

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch<TMDBResponse<Movie>>("/search/multi", {
    query,
    page: String(page),
    include_adult: "false",
  });
}

export async function getMovieGenres() {
  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list");
  return data.genres;
}

export async function getTVGenres() {
  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/tv/list");
  return data.genres;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export async function getMovieVideos(id: string) {
  const data = await tmdbFetch<{ results: VideoItem[] }>(`/movie/${id}/videos`);
  return data.results || [];
}

export async function getTVVideos(id: string) {
  const data = await tmdbFetch<{ results: VideoItem[] }>(`/tv/${id}/videos`);
  return data.results || [];
}

export function findBestTrailer(videos: VideoItem[]): VideoItem | null {
  if (!videos || videos.length === 0) return null;
  // 1. Official YouTube Trailer
  const officialTrailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official);
  if (officialTrailer) return officialTrailer;
  // 2. Official YouTube Teaser (Official studio teasers almost never disable website embedding)
  const officialTeaser = videos.find((v) => v.site === "YouTube" && v.type === "Teaser" && v.official);
  if (officialTeaser) return officialTeaser;
  // 3. Any official studio YouTube video
  const officialAny = videos.find((v) => v.site === "YouTube" && v.official);
  if (officialAny) return officialAny;
  // 4. Any Trailer
  const anyTrailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer");
  if (anyTrailer) return anyTrailer;
  // 5. Any Teaser
  const anyTeaser = videos.find((v) => v.site === "YouTube" && v.type === "Teaser");
  if (anyTeaser) return anyTeaser;
  return videos.find((v) => v.site === "YouTube") ?? null;
}

export function isUnreleasedContent(item?: {
  release_date?: string;
  first_air_date?: string;
  status?: string;
  vote_count?: number;
} | null): boolean {
  if (!item) return false;

  // 1. Explicit TMDB status not released
  if (
    item.status &&
    ["Post Production", "In Production", "Planned", "Rumored", "Upcoming"].includes(
      item.status
    )
  ) {
    return true;
  }

  // 2. Release date check
  const dateStr = item.release_date || item.first_air_date;
  if (dateStr) {
    const releaseTime = new Date(dateStr).getTime();
    if (!isNaN(releaseTime)) {
      // Future date = definitely unreleased
      if (releaseTime > Date.now()) return true;

      // Theatrical release within last 45 days (still exclusively in theaters, not available on digital streaming)
      const daysSinceRelease = (Date.now() - releaseTime) / (1000 * 60 * 60 * 24);
      if (daysSinceRelease >= 0 && daysSinceRelease <= 45) {
        return true;
      }
    }
  }

  return false;
}

export const POPULAR_GENRES: Genre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

export const POPULAR_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "KR", name: "South Korea" },
  { code: "JP", name: "Japan" },
  { code: "GB", name: "United Kingdom" },
  { code: "ID", name: "Indonesia" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "DE", name: "Germany" },
  { code: "TH", name: "Thailand" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IT", name: "Italy" },
  { code: "TR", name: "Turkey" },
  { code: "PH", name: "Philippines" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
];

export async function discoverMovies(params: {
  genre?: string;
  year?: string;
  country?: string;
  sort_by?: string;
  page?: number;
}) {
  const today = new Date().toISOString().split("T")[0];
  const p: Record<string, string> = {
    sort_by: params.sort_by ?? "popularity.desc",
    page: String(params.page ?? 1),
    include_adult: "false",
  };
  if (params.genre) p.with_genres = params.genre;
  if (params.year) {
    p.primary_release_year = params.year;
  } else {
    // Prevent unreleased future placeholder movies (e.g. late 2026/2027) from polluting results
    p["primary_release_date.lte"] = today;
  }
  if (params.sort_by === "primary_release_date.desc") {
    p["primary_release_date.lte"] = today;
    // Strict threshold: eliminate 0-vote AI-generated test uploads and unverified amateur junk
    p["vote_count.gte"] = "25";
    p["popularity.gte"] = "12";
  }
  if (params.country) p.with_origin_country = params.country;
  return tmdbFetch<TMDBResponse<Movie>>("/discover/movie", p);
}

export async function discoverTV(params: {
  genre?: string;
  year?: string;
  country?: string;
  sort_by?: string;
  page?: number;
}) {
  const today = new Date().toISOString().split("T")[0];
  const p: Record<string, string> = {
    sort_by: params.sort_by ?? "popularity.desc",
    page: String(params.page ?? 1),
  };
  if (params.genre) p.with_genres = params.genre;
  if (params.year) {
    p.first_air_date_year = params.year;
  } else {
    p["first_air_date.lte"] = today;
  }
  if (params.sort_by === "first_air_date.desc") {
    p["first_air_date.lte"] = today;
    // Strict threshold: eliminate AI-generated placeholder series
    p["vote_count.gte"] = "25";
    p["popularity.gte"] = "12";
  }
  if (params.country) p.with_origin_country = params.country;
  return tmdbFetch<TMDBResponse<Movie>>("/discover/tv", p);
}

export async function getLatestUploads(params?: {
  page?: number;
  type?: "all" | "movie" | "tv";
}): Promise<Movie[]> {
  const page = params?.page ?? 1;
  const type = params?.type ?? "all";
  const today = new Date().toISOString().split("T")[0];

  const fetchMovies = async () => {
    const res = await tmdbFetch<TMDBResponse<Movie>>("/discover/movie", {
      sort_by: "primary_release_date.desc",
      "primary_release_date.lte": today,
      "vote_count.gte": "25",
      "popularity.gte": "12",
      page: String(page),
      include_adult: "false",
    }).catch(() => ({ results: [] as Movie[], total_pages: 0, total_results: 0, page }));

    return (res.results || [])
      .filter((m) => Boolean(m.poster_path && m.overview && m.overview.length > 15))
      .map((m) => ({ ...m, media_type: "movie" as const }));
  };

  const fetchTV = async () => {
    const res = await tmdbFetch<TMDBResponse<Movie>>("/discover/tv", {
      sort_by: "first_air_date.desc",
      "first_air_date.lte": today,
      "vote_count.gte": "25",
      "popularity.gte": "12",
      page: String(page),
      include_adult: "false",
    }).catch(() => ({ results: [] as Movie[], total_pages: 0, total_results: 0, page }));

    return (res.results || [])
      .filter((m) => Boolean(m.poster_path && m.overview && m.overview.length > 15))
      .map((m) => ({ ...m, media_type: "tv" as const }));
  };

  if (type === "movie") return fetchMovies();
  if (type === "tv") return fetchTV();

  const [movies, tv] = await Promise.all([fetchMovies(), fetchTV()]);
  return [...movies, ...tv].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || "";
    const dateB = b.release_date || b.first_air_date || "";
    return dateB.localeCompare(dateA);
  });
}

// ---- Image Helpers ----
export function img(path: string | null, size: string = "w500"): string {
  if (!path) return "/poster-placeholder.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function backdrop(path: string | null): string {
  if (!path) return "/backdrop-placeholder.svg";
  return `https://image.tmdb.org/t/p/original${path}`;
}

export function displayTitle(item: Movie): string {
  return item.title ?? item.name ?? "Untitled";
}

export function displayYear(item: Movie): string {
  const date = item.release_date ?? item.first_air_date ?? "";
  return date ? date.slice(0, 4) : "";
}

export function isTV(item: Movie): boolean {
  return Boolean(item.name && !item.title) || item.media_type === "tv";
}

export function logo(path: string | null, size: string = "w500"): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

export function getGenreNames(genreIds?: number[], limit = 2): string {
  if (!genreIds || genreIds.length === 0) return "";
  return genreIds
    .map((id) => GENRE_MAP[id])
    .filter(Boolean)
    .slice(0, limit)
    .join(" · ");
}

export async function getTitleLogo(
  id: number | string,
  type: "movie" | "tv" = "movie"
): Promise<string | null> {
  try {
    const data = await tmdbFetch<{
      logos?: { file_path: string; iso_639_1: string | null }[];
    }>(`/${type}/${id}/images`, { include_image_language: "en,null,id" });
    if (!data?.logos || data.logos.length === 0) return null;
    const best =
      data.logos.find((l) => l.iso_639_1 === "en") ||
      data.logos.find((l) => !l.iso_639_1) ||
      data.logos[0];
    return best?.file_path ?? null;
  } catch {
    return null;
  }
}

export async function attachTitleLogos(items: Movie[]): Promise<Movie[]> {
  return Promise.all(
    items.map(async (item) => {
      if (item.logo_path) return item;
      const type = item.media_type === "tv" || (!item.title && item.name) ? "tv" : "movie";
      const logoPath = await getTitleLogo(item.id, type);
      return { ...item, logo_path: logoPath };
    })
  );
}
