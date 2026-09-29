import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-[#06070a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          {/* Logo & Description */}
          <div>
            <Link
              href="/"
              className="text-xl font-black tracking-tight text-white hover:opacity-95 transition-opacity"
            >
              Fardhan<span className="text-red-600">Flix</span>
            </Link>
            <p className="text-xs text-zinc-400 mt-1">
              Katalog film dan serial TV lengkap. Streaming gratis, tanpa iklan.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Navigasi footer">
            <ul className="flex flex-wrap items-center gap-6" role="list">
              <li>
                <Link href="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/films" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Film
                </Link>
              </li>
              <li>
                <Link href="/series" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Serial TV
                </Link>
              </li>
              <li>
                <Link href="/anime" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Anime
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Legal & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="text-center sm:text-left">
            Data &amp; metadata disediakan oleh{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-200 underline transition-colors"
            >
              TMDB
            </a>. FardhanFlix tidak menyimpan file video di server sendiri.
          </p>
          <p className="text-zinc-500 text-[11px]">
            &copy; {new Date().getFullYear()} FardhanFlix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
