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
      style={{ minHeight: "70vh", background: "var(--bg)" }}
      aria-label={`Film unggulan: ${title}`}
    >
      {/* Backdrop */}
      {item.backdrop_path && (
        <div className="absolute inset-0">
          <Image
            src={backdrop(item.backdrop_path)}
            alt={`Backdrop ${title}`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 backdrop-overlay" />
          {/* Side fade for large screens */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.5) 50%, rgba(10,10,15,0.2) 100%)",
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end"
        style={{ minHeight: "70vh", paddingBottom: "4rem", paddingTop: "6rem" }}
      >
        <div className="max-w-2xl animate-fade-in">
          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-1.5 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--accent)" }} aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{rating}</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>/ 10</span>
            </div>
          )}

          {/* Title */}
          <h1
            className="font-black leading-tight mb-3"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "var(--text)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
            }}
          >
            {title}
          </h1>

          {/* Year + type */}
          <div className="flex items-center gap-3 mb-4">
            {year && <span className="text-sm" style={{ color: "var(--text-muted)" }}>{year}</span>}
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
            >
              {type === "movie" ? "Film" : "Serial"}
            </span>
          </div>

          {/* Overview */}
          {item.overview && (
            <p
              className="text-sm leading-relaxed mb-6 line-clamp-3"
              style={{ color: "rgba(240,238,232,0.75)", maxWidth: "540px" }}
            >
              {item.overview}
            </p>
          )}

          {/* CTA */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`${href}?autoplay=1`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded font-semibold text-sm transition-colors"
              style={{ background: "var(--accent)", color: "#0a0a0f" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              Tonton Sekarang
            </Link>
            <Link
              href={href}
              className="inline-flex items-center gap-2 px-5 py-3 rounded font-semibold text-sm transition-colors"
              style={{ background: "rgba(240,238,232,0.1)", color: "var(--text)", border: "1px solid var(--border)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Detail
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
