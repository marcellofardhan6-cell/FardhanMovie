import { getMovieDetail, getMovieCredits, getMovieRecommendations, img, backdrop, displayYear } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import ServerSwitcher from "@/components/ServerSwitcher";
import type { Metadata } from "next";

export const revalidate = 86400;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetail(id);
    return {
      title: movie.title ?? "Film",
      description: movie.overview?.slice(0, 160),
    };
  } catch {
    return { title: "Film" };
  }
}

export default async function FilmDetailPage({ params }: Props) {
  const { id } = await params;

  const [movie, credits, recommendations] = await Promise.all([
    getMovieDetail(id).catch(() => null),
    getMovieCredits(id).catch(() => ({ cast: [], crew: [] })),
    getMovieRecommendations(id).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
  ]);

  if (!movie) notFound();

  const mainCast = credits.cast.slice(0, 12);
  const director = credits.crew.find((c) => c.job === "Director");
  const writers = credits.crew.filter((c) => c.job === "Screenplay" || c.job === "Writer" || c.job === "Story");
  const writerNames = writers.slice(0, 2).map((w) => w.name).join(", ");
  const year = displayYear(movie);
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}j ${movie.runtime % 60}m`
    : null;
  const releaseDateFormatted = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const countries = movie.production_countries && movie.production_countries.length > 0
    ? movie.production_countries.slice(0, 2).map((c) => c.name).join(", ")
    : null;
  const languages = movie.spoken_languages && movie.spoken_languages.length > 0
    ? movie.spoken_languages.slice(0, 2).map((l) => l.name || l.english_name).join(", ")
    : null;
  const companies = movie.production_companies && movie.production_companies.length > 0
    ? movie.production_companies.slice(0, 2).map((c) => c.name).join(", ")
    : null;
  const budget = movie.budget && movie.budget > 0
    ? `$${(movie.budget / 1_000_000).toFixed(1)} Juta USD`
    : null;
  const revenue = movie.revenue && movie.revenue > 0
    ? `$${(movie.revenue / 1_000_000).toFixed(1)} Juta USD`
    : null;
  const statusMap: Record<string, string> = {
    Released: "Sudah Rilis Bioskop",
    "Post Production": "Pasca Produksi",
    "In Production": "Sedang Diproduksi",
    Planned: "Direncanakan",
  };
  const statusText = movie.status ? (statusMap[movie.status] || movie.status) : null;

  return (
    <article className="min-h-screen bg-[#06070a] text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Breadcrumb & Film Header */}
        <div className="mb-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/films" className="hover:text-white transition-colors">Film</Link>
            <span>/</span>
            <span className="text-zinc-200 truncate max-w-xs sm:max-w-none">{movie.title}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-xs sm:text-sm text-zinc-400 italic mt-1 font-serif">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}
            </div>

            {/* Rating Badge */}
            {movie.vote_average > 0 && (
              <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-red-500/30 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-500" aria-hidden>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-bold text-red-400">{movie.vote_average.toFixed(1)}</span>
                <span className="text-[11px] text-zinc-400">/ 10 ({movie.vote_count.toLocaleString("id-ID")})</span>
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
            {runtime && (
              <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
                {runtime}
              </span>
            )}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-red-400 border border-red-500/30 bg-red-500/[0.05]">
              4K UHD
            </span>
            {movie.genres?.map((g) => (
              <Link
                key={g.id}
                href={`/films?genre=${g.id}`}
                className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-red-400 border border-white/[0.08] transition-colors"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>

        {/* INSTANT VIDEO PLAYER (LANGSUNG MUNCUL TANPA KLIK TOMBOL) */}
        <div className="mb-12" id="player">
          <ServerSwitcher tmdbId={Number(id)} type="movie" />
        </div>

        {/* Comprehensive Information & Synopsis Card */}
        <div className="flex flex-col lg:flex-row gap-8 mb-14 p-6 sm:p-8 rounded-2xl bg-[#0c0e15] border border-white/[0.08] shadow-2xl">
          {/* Poster Thumbnail */}
          <div className="shrink-0 mx-auto lg:mx-0">
            <div
              className="relative rounded-xl overflow-hidden shadow-2xl border border-white/[0.1] bg-[#0d0f15]"
              style={{ width: "190px", height: "285px" }}
            >
              <Image
                src={img(movie.poster_path, "w500")}
                alt={`Poster ${movie.title}`}
                fill
                className="object-cover"
                unoptimized={!movie.poster_path}
              />
            </div>
            {/* Quick feature tags */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-red-400 border border-red-500/30 bg-red-600/10">
                4K UHD
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-zinc-300 border border-white/[0.1] bg-white/[0.04]">
                Sub Indo
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-zinc-300 border border-white/[0.1] bg-white/[0.04]">
                Dolby 5.1
              </span>
            </div>
          </div>

          {/* Metadata & Synopsis Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Card Header & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  Informasi & Sinopsis Film
                </h2>
                {statusText && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {statusText}
                  </span>
                )}
              </div>

              {/* Genre Badges (Clickable) */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs text-zinc-400 font-semibold mr-1">Genre:</span>
                  {movie.genres.map((g) => (
                    <Link
                      key={g.id}
                      href={`/films?genre=${g.id}`}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600/15 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-all cursor-pointer shadow-sm"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Synopsis Body */}
              <p className="text-sm leading-relaxed text-zinc-300 mb-6 font-normal">
                {movie.overview || "Sinopsis resmi belum tersedia untuk film ini."}
              </p>
            </div>

            {/* Detailed Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3.5 gap-x-6 pt-5 border-t border-white/[0.08] text-xs">
              {director && (
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase tracking-wider mb-0.5">Sutradara</span>
                  <span className="text-white font-medium">{director.name}</span>
                </div>
              )}

              {writerNames && (
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase tracking-wider mb-0.5">Penulis Naskah</span>
                  <span className="text-white font-medium">{writerNames}</span>
                </div>
              )}

              {releaseDateFormatted && (
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase tracking-wider mb-0.5">Tanggal Rilis</span>
                  <span className="text-white font-medium">{releaseDateFormatted}</span>
                </div>
              )}

              {runtime && (
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase tracking-wider mb-0.5">Durasi</span>
                  <span className="text-white font-medium">{runtime}</span>
                </div>
              )}

              {countries && (
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase tracking-wider mb-0.5">Negara Asal</span>
                  <span className="text-white font-medium">{countries}</span>
                </div>
              )}

              {languages && (
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase tracking-wider mb-0.5">Bahasa Audio</span>
                  <span className="text-white font-medium">{languages}</span>
                </div>
              )}

              {companies && (
                <div className="sm:col-span-2">
                  <span className="text-zinc-500 block text-[11px] uppercase tracking-wider mb-0.5">Studio Produksi</span>
                  <span className="text-white font-medium">{companies}</span>
                </div>
              )}

              {budget && (
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase tracking-wider mb-0.5">Biaya Produksi</span>
                  <span className="text-white font-medium">{budget}</span>
                </div>
              )}

              {revenue && (
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase tracking-wider mb-0.5">Pendapatan Box Office</span>
                  <span className="text-emerald-400 font-medium">{revenue}</span>
                </div>
              )}

              {movie.vote_average > 0 && (
                <div>
                  <span className="text-zinc-500 block text-[11px] uppercase tracking-wider mb-0.5">Skor Penonton</span>
                  <span className="text-red-400 font-bold">
                    ★ {movie.vote_average.toFixed(1)} / 10 ({movie.vote_count.toLocaleString("id-ID")} suara)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {mainCast.length > 0 && (
          <section aria-label="Pemeran" className="mb-14">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
                Pemeran Utama
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
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
                Film Serupa yang Direkomendasikan
              </h2>
            </div>
            <MovieGrid items={recommendations.results.slice(0, 10)} />
          </section>
        )}
      </div>
    </article>
  );
}
