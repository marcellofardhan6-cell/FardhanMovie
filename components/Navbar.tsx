"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useFavorites } from "@/context/FavoritesContext";
import { POPULAR_GENRES } from "@/lib/tmdb";

export default function Navbar() {
  const { favoritesCount } = useFavorites();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileSearchOpen(false);
        searchRef.current?.blur();
        mobileSearchRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = searchQuery.trim();
      if (q) {
        router.push(`/search?q=${encodeURIComponent(q)}`);
        searchRef.current?.blur();
      }
    },
    [searchQuery, router]
  );

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/films", label: "Movies" },
    { href: "/series", label: "TV Series" },
    { href: "/genres", label: "Genres" },
    { href: "/anime", label: "Anime" },
    { href: "/country", label: "Country" },
    { href: "/favorites", label: "Favorites" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-[#06070a]/95 backdrop-blur-md border-b border-white/[0.06]"
          : "bg-gradient-to-b from-[#06070a]/90 via-[#06070a]/40 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand Wordmark + Nav Links */}
          <div className="flex items-center gap-8 sm:gap-10">
            {/* Wordmark Logo */}
            <Link
              href="/"
              className="text-xl sm:text-2xl font-black tracking-tight text-white hover:opacity-95 transition-opacity"
              aria-label="FardhanFlix"
            >
              Fardhan<span className="text-red-600">Flix</span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href === "/country" && pathname.startsWith("/country")) || (link.href === "/genres" && pathname.startsWith("/genres"));
                if (link.href === "/genres") {
                  return (
                    <div key={link.href} className="relative group">
                      <Link
                        href="/genres"
                        className={`text-sm tracking-wide transition-colors flex items-center gap-1 ${
                          isActive
                            ? "text-white font-medium"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        Genres
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-200 group-hover:rotate-180 text-zinc-500 group-hover:text-zinc-300"
                          aria-hidden
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </Link>

                      {/* Dropdown Popover */}
                      <div className="absolute top-full -left-10 pt-2 hidden group-hover:block z-50">
                        <div className="w-72 p-3 rounded-2xl bg-[#0c0e15]/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl">
                          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/[0.06]">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                              Popular Genres
                            </span>
                            <Link
                              href="/genres"
                              className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                            >
                              All Genres &rarr;
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto pr-1">
                            {POPULAR_GENRES.map((g) => (
                              <Link
                                key={g.id}
                                href={`/films?genre=${g.id}`}
                                className="px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors truncate"
                              >
                                {g.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (link.href === "/country") {
                  return (
                    <div key={link.href} className="relative group">
                      <Link
                        href="/country"
                        className={`text-sm tracking-wide transition-colors flex items-center gap-1 ${
                          isActive
                            ? "text-white font-medium"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        Country
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-200 group-hover:rotate-180 text-zinc-500 group-hover:text-zinc-300"
                          aria-hidden
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </Link>

                      {/* Quick Country Dropdown on Hover */}
                      <div className="absolute top-full left-0 pt-2 hidden group-hover:block z-50">
                        <div className="w-48 py-2 rounded-xl bg-[#0c0e15]/95 backdrop-blur-xl border border-white/[0.1] shadow-2xl">
                          <div className="px-3 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            Popular Countries
                          </div>
                          <Link href="/country?code=US" className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors">
                            <span>United States</span>
                            <span className="text-[10px] text-zinc-500">US</span>
                          </Link>
                          <Link href="/country?code=KR" className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors">
                            <span>South Korea</span>
                            <span className="text-[10px] text-zinc-500">KR</span>
                          </Link>
                          <Link href="/country?code=JP" className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors">
                            <span>Japan</span>
                            <span className="text-[10px] text-zinc-500">JP</span>
                          </Link>
                          <Link href="/country?code=ID" className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors">
                            <span>Indonesia</span>
                            <span className="text-[10px] text-zinc-500">ID</span>
                          </Link>
                          <Link href="/country?code=GB" className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors">
                            <span>United Kingdom</span>
                            <span className="text-[10px] text-zinc-500">GB</span>
                          </Link>
                          <Link href="/country?code=CN" className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors">
                            <span>China</span>
                            <span className="text-[10px] text-zinc-500">CN</span>
                          </Link>
                          <div className="my-1 border-t border-white/[0.06]" />
                          <Link href="/country" className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-colors">
                            <span>All Countries</span>
                            <span>&rarr;</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm tracking-wide transition-colors ${
                      isActive
                        ? "text-white font-medium"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search & Mobile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search Input (Hidden on mobile) */}
            <form onSubmit={handleSearch} role="search" aria-label="Search movies or TV shows" className="hidden sm:block">
              <div className="relative">
                <label htmlFor="navbar-search" className="sr-only">Search movies or TV shows</label>
                <input
                  ref={searchRef}
                  id="navbar-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles..."
                  autoComplete="off"
                  className="w-36 sm:w-56 text-xs text-white bg-white/[0.05] focus:bg-[#0c0e15] border border-white/[0.08] focus:border-white/30 rounded-lg py-2 pl-8 pr-3 outline-none transition-all placeholder:text-zinc-500"
                  aria-label="Search movies or TV series"
                />
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            </form>

            {/* Mobile Search Toggle Icon Button */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="sm:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              aria-label="Search"
              title="Search"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Favorites Icon Button */}
            <Link
              href="/favorites"
              className={`relative p-2 rounded-lg transition-colors flex items-center justify-center ${
                pathname === "/favorites"
                  ? "text-red-500 bg-red-500/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
              aria-label={`Favorites (${favoritesCount})`}
              title="My Favorites"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill={favoritesCount > 0 ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={favoritesCount > 0 ? "text-red-500" : ""}
                aria-hidden
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-red-600 rounded-full shadow-sm">
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open navigation menu"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                {menuOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <path d="M3 12h18" />
                    <path d="M3 6h18" />
                    <path d="M3 18h18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search Bar */}
        {mobileSearchOpen && (
          <div className="sm:hidden pb-3 pt-1 border-t border-white/[0.06] animate-fade-in">
            <form onSubmit={handleSearch} role="search" aria-label="Search movies or TV shows">
              <div className="relative">
                <input
                  ref={mobileSearchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies, series, anime..."
                  autoComplete="off"
                  autoFocus
                  className="w-full text-xs text-white bg-white/[0.08] focus:bg-[#0c0e15] border border-white/20 focus:border-red-500 rounded-full py-2 pl-9 pr-3 outline-none transition-all placeholder:text-zinc-400 shadow-inner"
                  aria-label="Search movies or TV series"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            </form>
          </div>
        )}

        {/* Mobile 7reels Sub-Nav Tab Bar (Home, Movies, Series, My List) */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-white/[0.06] -mx-4 px-4 bg-[#06070a]/95 backdrop-blur-md">
          <Link
            href="/"
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
              pathname === "/"
                ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/films"
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
              pathname === "/films" || pathname.startsWith("/film")
                ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Movies
          </Link>
          <Link
            href="/series"
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
              pathname.startsWith("/series")
                ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Series
          </Link>
          <Link
            href="/favorites"
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
              pathname === "/favorites"
                ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            My List
          </Link>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden py-4 border-t border-white/[0.08] animate-fade-in"
          >
            <nav className="flex flex-col space-y-2" aria-label="Navigasi mobile">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                if (link.href === "/genres") {
                  return (
                    <div key={link.href} className="space-y-1">
                      <Link
                        href="/genres"
                        className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                          isActive
                            ? "text-white font-medium bg-white/[0.06]"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span>Genres</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Browse</span>
                      </Link>
                      <div className="grid grid-cols-3 gap-1 px-3 py-1">
                        {POPULAR_GENRES.slice(0, 9).map((g) => (
                          <Link
                            key={g.id}
                            href={`/films?genre=${g.id}`}
                            className="text-[11px] text-center px-2 py-1 rounded-md bg-white/[0.04] text-zinc-300 hover:text-white border border-white/[0.06] truncate"
                          >
                            {g.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "text-white font-medium bg-white/[0.06]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
