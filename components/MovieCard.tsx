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
      className="group block rounded-lg overflow-hidden transition-transform duration-200 hover:-translate-y-1 focus-visible:ring-2"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      aria-label={`${title}${year ? " (" + year + ")" : ""}${rating ? ", rating " + rating : ""}`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={posterUrl}
          alt={`Poster ${title}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={priority}
          unoptimized={posterUrl.startsWith("/")}
        />
        {/* Rating badge */}
        {rating && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
            style={{ background: "rgba(10,10,15,0.85)", color: "var(--accent)" }}
            aria-label={`Rating ${rating}`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {rating}
          </div>
        )}
        {/* Type badge */}
        {type === "series" && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium"
            style={{ background: "rgba(10,10,15,0.85)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            Serial
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3
          className="text-sm font-semibold line-clamp-2 leading-snug mb-1"
          style={{ color: "var(--text)", fontFamily: "var(--font-fraunces)" }}
        >
          {title}
        </h3>
        {year && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {year}
          </p>
        )}
      </div>
    </Link>
  );
}
