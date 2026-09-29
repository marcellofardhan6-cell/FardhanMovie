import Link from "next/link";
import Image from "next/image";
import { Movie, img, displayTitle, displayYear, isTV } from "@/lib/tmdb";

interface Props {
  item: Movie;
  priority?: boolean;
}

export default function MovieCard({ item, priority = false }: Props) {
  const title = displayTitle(item);
  const year = displayYear(item);
  const type = item.media_type === "tv" || isTV(item) ? "series" : "movie";
  const href = `/${type === "movie" ? "film" : "series"}/${item.id}`;
  const posterUrl = img(item.poster_path, "w342");
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <Link
      href={href}
      className="group block relative rounded-xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-amber-400"
      style={{
        background: "var(--surface)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
      aria-label={`${title}${year ? " (" + year + ")" : ""}${rating ? ", rating " + rating : ""}`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-[#0d0f15]">
        <Image
          src={posterUrl}
          alt={`Poster ${title}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
          priority={priority}
          unoptimized={posterUrl.startsWith("/")}
        />

        {/* Ambient Dark Gradient on Poster Base */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Floating Top Rating Badge */}
        {rating && (
          <div
            className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight backdrop-blur-md shadow-md"
            style={{
              background: "rgba(6, 7, 10, 0.75)",
              color: "#f5c563",
              border: "1px solid rgba(229, 169, 59, 0.35)",
            }}
            aria-label={`Rating ${rating}`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {rating}
          </div>
        )}

        {/* Floating Type Pill */}
        {type === "series" ? (
          <div
            className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase backdrop-blur-md"
            style={{
              background: "rgba(6, 7, 10, 0.75)",
              color: "#e2e4ed",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            Serial
          </div>
        ) : (
          <div
            className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase backdrop-blur-md"
            style={{
              background: "rgba(6, 7, 10, 0.7)",
              color: "rgba(229, 169, 59, 0.9)",
              border: "1px solid rgba(229, 169, 59, 0.25)",
            }}
          >
            HD
          </div>
        )}

        {/* Play Icon Reveal on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-amber-500 to-amber-300 text-black shadow-[0_0_25px_rgba(229,169,59,0.6)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5" aria-hidden>
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Movie Information Footer */}
      <div className="p-3.5 bg-gradient-to-b from-[#0e1017] to-[#0a0b10] border-t border-white/[0.05]">
        <h3 className="text-xs sm:text-sm font-semibold line-clamp-1 leading-snug mb-1 text-zinc-100 group-hover:text-amber-400 transition-colors duration-200">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          {year ? <span>{year}</span> : <span />}
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium group-hover:text-amber-400/80 transition-colors">
            {type === "movie" ? "Film" : "TV"}
          </span>
        </div>
      </div>
    </Link>
  );
}
