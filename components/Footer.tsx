import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="mt-16 py-10 px-4"
      style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden>
            <rect width="28" height="28" rx="4" fill="#e8a000" />
            <path d="M7 8h14M7 14h10M7 20h12" stroke="#0a0a0f" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="21" cy="20" r="2.5" fill="#0a0a0f" />
          </svg>
          <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)" }}>
            CineVault
          </span>
        </div>
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          Metadata film disediakan oleh{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            The Movie Database (TMDB)
          </a>. CineVault tidak menyimpan atau mendistribusikan konten film.
        </p>
        <nav aria-label="Navigasi footer">
          <ul className="flex items-center gap-4" role="list">
            <li>
              <Link href="/" className="text-xs transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>Beranda</Link>
            </li>
            <li>
              <Link href="/films" className="text-xs transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>Film</Link>
            </li>
            <li>
              <Link href="/series" className="text-xs transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>Serial</Link>
            </li>
            <li>
              <Link href="/anime" className="text-xs transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>Anime</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
