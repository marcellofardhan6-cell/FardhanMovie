import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-[#06070a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          {/* Logo & Description */}
          <div>
            <Logo size="md" />
            <p className="text-xs text-zinc-400 mt-1">
              Your ultimate movie and TV series streaming catalog. Free and ad-free.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-6" role="list">
              <li>
                <Link href="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/films" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/series" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  TV Series
                </Link>
              </li>
              <li>
                <Link href="/anime" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Anime
                </Link>
              </li>
              <li>
                <Link href="/country" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Country
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Legal & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="text-center sm:text-left">
            Movie &amp; TV metadata provided by{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-200 underline transition-colors"
            >
              TMDB
            </a>. FardhanFlix does not host or store any media files on its servers.
          </p>
          <p className="text-zinc-500 text-[11px]">
            &copy; {new Date().getFullYear()} FardhanFlix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
