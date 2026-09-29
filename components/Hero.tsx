import Link from "next/link";
import Image from "next/image";
import { Movie, backdrop, displayTitle, displayYear, isTV } from "@/lib/tmdb";

interface Props {
  item: Movie;
}

export default function Hero({ item }: Props) {
  const title = displayTitle(item);
  const year = displayYear(item);
  const type = item.media_type === "tv" || isTV(item) ? "series" : "movie";
  const href = `/${type === "movie" ? "film" : "series"}/${item.id}`;
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "82vh", background: "var(--bg)" }}
      aria-label={`Film unggulan: ${title}`}
    >
      {/* Cinematic Backdrop Image */}
      {item.backdrop_path && (
        <div className="absolute inset-0">
          <Image
            src={backdrop(item.backdrop_path)}
            alt={`Backdrop ${title}`}
            fill
            priority
            className="object-cover object-top scale-105 transform animate-fade-in"
            sizes="100vw"
          />
          {/* Bottom vignette to deep obsidian */}
          <div className="absolute inset-0 backdrop-overlay" />
          {/* Left theatrical shadow for high readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#06070a] via-[#06070a]/75 to-transparent sm:w-3/4" />
          {/* Top subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#06070a]/80 via-transparent to-transparent h-40" />
          {/* Subtle warm cinema spotlight glow in bottom left */}
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      {/* Hero Content */}
      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end"
        style={{ minHeight: "82vh", paddingBottom: "5.5rem", paddingTop: "8rem" }}
      >
        <div className="max-w-2xl animate-fade-in">
          {/* Premium Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/[0.12] border border-amber-400/30 backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(229,169,59,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-300">
              Pilihan Utama Minggu Ini
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-black leading-[1.08] tracking-tight mb-4 text-white drop-shadow-2xl"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)",
            }}
          >
            {title}
          </h1>

          {/* Specs & Meta Row */}
          <div className="flex flex-wrap items-center gap-3 mb-5 text-xs font-medium text-zinc-300">
            {/* Rating badge */}
            {rating && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 border border-amber-400/30 backdrop-blur-md">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400" aria-hidden>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="font-bold text-amber-300">{rating}</span>
                <span className="text-[10px] text-zinc-400">/ 10</span>
              </div>
            )}

            {year && <span>{year}</span>}
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            
            <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-white/[0.08] border border-white/[0.12] text-zinc-200">
              {type === "movie" ? "FILM" : "SERIAL"}
            </span>

            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider text-amber-400/90 border border-amber-400/30 bg-amber-400/[0.05]">
              4K ULTRA HD
            </span>
          </div>

          {/* Overview */}
          {item.overview && (
            <p className="text-sm sm:text-base leading-relaxed mb-8 line-clamp-3 text-zinc-300/90 max-w-xl font-normal drop-shadow">
              {item.overview}
            </p>
          )}

          {/* Luxury CTA Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={href}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-bold text-sm text-[#07080c] transition-all duration-300 transform hover:-translate-y-0.5 shadow-[0_0_35px_rgba(229,169,59,0.35)] hover:shadow-[0_0_50px_rgba(229,169,59,0.55)] cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #fce289 0%, #e5a93b 55%, #bd8016 100%)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="transition-transform group-hover:scale-110" aria-hidden>
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              <span>Putar Film</span>
            </Link>

            <Link
              href={href}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm text-zinc-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.15] hover:border-white/30 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>Sinopsis &amp; Detail</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
