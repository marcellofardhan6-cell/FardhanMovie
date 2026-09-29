import MovieCard from "./MovieCard";
import { Movie } from "@/lib/tmdb";

interface Props {
  items: Movie[];
  title?: string;
  emptyMessage?: string;
}

export default function MovieGrid({ items, title, emptyMessage = "Tidak ada konten." }: Props) {
  return (
    <section aria-label={title}>
      {title && (
        <h2
          className="text-xl font-bold mb-5"
          style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)" }}
        >
          {title}
        </h2>
      )}
      {items.length === 0 ? (
        <div
          className="flex items-center justify-center py-20 rounded-lg"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p style={{ color: "var(--text-muted)" }}>{emptyMessage}</p>
        </div>
      ) : (
        <ul
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          role="list"
          aria-label={title}
        >
          {items.map((item, i) => (
            <li key={`${item.id}-${i}`}>
              <MovieCard item={item} priority={i < 5} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
