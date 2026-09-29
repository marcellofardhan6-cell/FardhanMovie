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
      style={{ minHeight: "75vh", background: "#06070a" }}
      aria-label={`Film unggulan: ${title}`}
    >
      {/* Full Backdrop */}
      {item.backdrop_path && (
        <div className="absolute inset-0">
          <Image
            src={backdrop(item.backdrop_path)}
            alt={`Backdrop ${title}`}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Natural Vignette and Contrast Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06070a] via-[#06070a]/80 to-transparent sm:w-2/3" />
        </div>
      )}

      {/* Content */}
      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end"
        style={{ minHeight: "75vh", paddingBottom: "4.5rem", paddingTop: "7rem" }}
      >
        <div className="max-w-2xl">
          {/* Title - Clean, bold modern streaming typography */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.05] mb-3 drop-shadow-md">
            {title}
          </h1>

          {/* Clean Metadata Row (Netflix style: no tacky glowing pill badges) */}
          <div className="flex items-center gap-3 mb-4 text-xs font-medium text-zinc-300">
            {rating && (
              <span className="flex items-center gap-1 font-bold text-red-500">
                <span>★</span>
                <span>{rating}</span>
              </span>
            )}
            {year && <span>{year}</span>}
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-300">{type === "movie" ? "Film" : "Serial"}</span>
            <span className="text-zinc-500">•</span>
            <span className="border border-zinc-700 px-1 py-0.2 rounded text-[10px] text-zinc-400 font-mono">
              HD
            </span>
          </div>

          {/* Synopsis */}
          {item.overview && (
            <p className="text-sm sm:text-base leading-relaxed text-zinc-300/90 mb-6 line-clamp-3 max-w-xl font-normal">
              {item.overview}
            </p>
          )}

          {/* Real Streaming Action Buttons (Clean rounded-md, not oversized glowing pills) */}
          <div className="flex items-center gap-3">
            <Link
              href={href}
              className="inline-flex items-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold px-6 py-2.5 rounded-md text-sm transition-colors shadow-lg cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              <span>Putar Film</span>
            </Link>

            <Link
              href={href}
              className="inline-flex items-center gap-2 bg-zinc-700/60 hover:bg-zinc-700/80 text-white font-medium px-5 py-2.5 rounded-md text-sm backdrop-blur-sm transition-colors cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>Detail Film</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
