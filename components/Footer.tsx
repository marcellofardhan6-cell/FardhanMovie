import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.08] bg-[#07080c] overflow-hidden">
      {/* Top subtle ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          {/* Logo & Description */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-[0_0_15px_rgba(229,169,59,0.3)]">
              <div className="w-full h-full bg-[#08090d] rounded-[7px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                  <path
                    d="M19.82 2H4.18C2.97 2 2 2.97 2 4.18v15.64C2 21.03 2.97 22 4.18 22h15.64c1.21 0 2.18-.97 2.18-2.18V4.18C22 2.97 21.03 2 19.82 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M7 2v20M17 2v20M2 12h20" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div>
              <span
                className="text-lg font-black tracking-tight text-white"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                FARDHAN<span className="text-amber-400">CINE</span>
              </span>
              <p className="text-[11px] text-zinc-400">Koleksi sinematik terlengkap &amp; streaming gratis.</p>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Navigasi footer">
            <ul className="flex flex-wrap items-center justify-center gap-6" role="list">
              <li>
                <Link href="/" className="text-xs font-medium text-zinc-400 hover:text-amber-300 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/films" className="text-xs font-medium text-zinc-400 hover:text-amber-300 transition-colors">
                  Katalog Film
                </Link>
              </li>
              <li>
                <Link href="/series" className="text-xs font-medium text-zinc-400 hover:text-amber-300 transition-colors">
                  Serial TV
                </Link>
              </li>
              <li>
                <Link href="/anime" className="text-xs font-medium text-zinc-400 hover:text-amber-300 transition-colors">
                  Anime Populer
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Legal & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p className="text-center sm:text-left">
            Data &amp; metadata disediakan oleh{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-amber-300 underline transition-colors"
            >
              The Movie Database (TMDB)
            </a>. FardhanCine tidak menyimpan file video di server sendiri.
          </p>
          <p className="text-zinc-400 text-[11px]">
            &copy; {new Date().getFullYear()} FardhanCine. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
