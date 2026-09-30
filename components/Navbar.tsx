"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useFavorites } from "@/context/FavoritesContext";
import { POPULAR_GENRES, ANIME_GENRE_LIST, img } from "@/lib/tmdb";
import Logo from "@/components/Logo";

interface LiveSearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  media_type: "movie" | "tv";
  release_date?: string;
  vote_average?: number;
}

export default function Navbar() {
  const { favoritesCount } = useFavorites();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LiveSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const desktopSearchContainerRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

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
    setSearchDropdownOpen(false);
  }, [pathname]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        desktopSearchContainerRef.current &&
        !desktopSearchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced live search autocomplete
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      setSearchLoading(false);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    setSearchLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setSearchDropdownOpen(true);
        }
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileSearchOpen(false);
        setSearchDropdownOpen(false);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        menuOpen || mobileSearchOpen
          ? "bg-[#06070a]/75 border-b border-white/[0.1] shadow-2xl"
          : scrolled
          ? "bg-[#06070a]/90 border-b border-white/[0.08]"
          : "bg-gradient-to-b from-[#06070a]/90 via-[#06070a]/40 to-transparent"
      }`}
      style={{
        backdropFilter: (scrolled || menuOpen || mobileSearchOpen) ? "blur(24px)" : "none",
        WebkitBackdropFilter: (scrolled || menuOpen || mobileSearchOpen) ? "blur(24px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand Wordmark + Nav Links */}
          <div className="flex items-center gap-8 sm:gap-10">
            {/* Bespoke Cinema Monogram & Wordmark Logo */}
            <Logo size="md" />

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href === "/country" && pathname.startsWith("/country")) ||
                  (link.href === "/genres" && pathname.startsWith("/genres")) ||
                  (link.href === "/anime" && pathname.startsWith("/anime"));
                if (link.href === "/genres") {
                  const isAnimeMode = pathname.startsWith("/anime");
                  return (
                    <div key={link.href} className="relative group">
                      <Link
                        href={isAnimeMode ? "/anime" : "/genres"}
                        className={`text-sm tracking-wide transition-colors flex items-center gap-1 ${
                          isActive
                            ? isAnimeMode
                              ? "text-[#FF6400] font-bold"
                              : "text-white font-medium"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {isAnimeMode ? "Anime Genres" : "Genres"}
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
                              {isAnimeMode ? "Genre Anime" : "Popular Genres"}
                            </span>
                            <Link
                              href={isAnimeMode ? "/anime" : "/genres"}
                              className={`text-[10px] font-bold transition-colors ${
                                isAnimeMode ? "text-[#FF6400] hover:text-[#ff7b1a]" : "text-red-400 hover:text-red-300"
                              }`}
                            >
                              Semua &rarr;
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 gap-1 max-h-72 overflow-y-auto pr-1">
                            {isAnimeMode
                              ? ANIME_GENRE_LIST.filter((g) => g.id !== "").map((g) => (
                                  <Link
                                    key={g.id}
                                    href={`/anime?genre=${g.id}`}
                                    className="px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-[#FF6400] hover:bg-white/[0.06] transition-colors truncate flex items-center gap-1.5"
                                  >
                                    <span className="text-xs">{g.icon}</span>
                                    <span className="truncate">{g.name}</span>
                                  </Link>
                                ))
                              : POPULAR_GENRES.map((g) => (
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
                if (link.href === "/anime") {
                  return (
                    <Link
                      key={link.href}
                      href="/anime"
                      className={`text-sm tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                        isActive
                          ? "text-[#FF6400] font-black"
                          : "text-zinc-400 hover:text-[#FF6400]"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span>Anime</span>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded transition-colors ${
                          isActive
                            ? "bg-[#FF6400] text-black"
                            : "bg-white/[0.08] text-zinc-400 group-hover:text-white"
                        }`}
                      >
                        JP
                      </span>
                    </Link>
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
            {/* Desktop Search Input with Live Autocomplete */}
            <div ref={desktopSearchContainerRef} className="relative hidden sm:block">
              <form onSubmit={handleSearch} role="search" aria-label="Search movies or TV shows">
                <div className="relative">
                  <label htmlFor="navbar-search" className="sr-only">Search movies or TV shows</label>
                  <input
                    ref={searchRef}
                    id="navbar-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setSearchDropdownOpen(true);
                    }}
                    placeholder="Search titles..."
                    autoComplete="off"
                    className="w-36 sm:w-56 text-xs text-white bg-white/[0.05] focus:bg-[#0c0e15] border border-white/[0.08] focus:border-white/30 rounded-lg py-2 pl-8 pr-7 outline-none transition-all placeholder:text-zinc-500"
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
                  {searchLoading && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </form>

              {/* Desktop Live Search Dropdown */}
              {searchDropdownOpen && searchQuery.trim().length >= 2 && (
                <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl bg-[#0c0e15]/98 backdrop-blur-xl border border-white/[0.12] shadow-2xl p-2 z-50 animate-fade-in">
                  <div className="flex items-center justify-between px-2.5 py-1 border-b border-white/[0.06] mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Hasil Pencarian
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {searchResults.length} ditemukan
                    </span>
                  </div>

                  {searchResults.length === 0 && !searchLoading ? (
                    <div className="py-6 text-center text-xs text-zinc-400">
                      Tidak ada film atau serial yang cocok.
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
                      {searchResults.map((item) => (
                        <button
                          type="button"
                          key={`desktop-${item.media_type}-${item.id}`}
                          onClick={() => {
                            setSearchDropdownOpen(false);
                            setSearchQuery("");
                            router.push(item.media_type === "tv" ? `/series/${item.id}` : `/film/${item.id}`);
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] transition-colors text-left group cursor-pointer"
                        >
                          <div className="relative w-9 h-12 rounded-md overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                            <Image
                              src={img(item.poster_path, "w185")}
                              alt={item.title}
                              fill
                              className="object-cover"
                              unoptimized={!item.poster_path}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                              <span className="px-1 py-0.2 rounded text-[9px] font-bold uppercase bg-white/10 text-zinc-300">
                                {item.media_type === "tv" ? "Serial" : "Film"}
                              </span>
                              {item.release_date && <span>{item.release_date.slice(0, 4)}</span>}
                              {item.vote_average ? (
                                <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                                  ★ {item.vote_average.toFixed(1)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => {
                      setSearchDropdownOpen(false);
                    }}
                    className="block text-center text-xs font-bold text-red-400 hover:text-red-300 transition-colors pt-2 pb-1 border-t border-white/[0.06] mt-1"
                  >
                    Lihat semua hasil pencarian &rarr;
                  </Link>
                </div>
              )}
            </div>

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

        {/* Mobile Expandable Search Bar with Live Autocomplete */}
        {mobileSearchOpen && (
          <div className="sm:hidden pb-3 pt-1 border-t border-white/[0.06] animate-fade-in">
            <form onSubmit={handleSearch} role="search" aria-label="Search movies or TV shows">
              <div className="relative">
                <input
                  ref={mobileSearchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari film, serial, anime..."
                  autoComplete="off"
                  autoFocus
                  className="w-full text-xs text-white bg-white/[0.08] focus:bg-[#0c0e15] border border-white/20 focus:border-red-500 rounded-full py-2.5 pl-9 pr-9 outline-none transition-all placeholder:text-zinc-400 shadow-inner"
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
                {searchLoading ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
                    aria-label="Clear search"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                ) : null}
              </div>
            </form>

            {/* Mobile Live Results Popover */}
            {searchQuery.trim().length >= 2 && (
              <div className="mt-2 rounded-2xl bg-[#0c0e15]/98 border border-white/[0.12] p-2 shadow-2xl max-h-72 overflow-y-auto">
                <div className="flex items-center justify-between px-2.5 py-1 border-b border-white/[0.06] mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Hasil Cepat
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {searchResults.length} ditemukan
                  </span>
                </div>

                {searchResults.length === 0 && !searchLoading ? (
                  <div className="py-4 text-center text-xs text-zinc-400">
                    Tidak ada film yang cocok.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((item) => (
                      <button
                        type="button"
                        key={`mobile-${item.media_type}-${item.id}`}
                        onClick={() => {
                          setMobileSearchOpen(false);
                          setSearchQuery("");
                          router.push(item.media_type === "tv" ? `/series/${item.id}` : `/film/${item.id}`);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl active:bg-white/[0.1] transition-colors text-left"
                      >
                        <div className="relative w-8 h-11 rounded-md overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                          <Image
                            src={img(item.poster_path, "w185")}
                            alt={item.title}
                            fill
                            className="object-cover"
                            unoptimized={!item.poster_path}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-400">
                            <span className="px-1 py-0.2 rounded text-[9px] font-bold uppercase bg-white/10 text-zinc-300">
                              {item.media_type === "tv" ? "Serial" : "Film"}
                            </span>
                            {item.release_date && <span>{item.release_date.slice(0, 4)}</span>}
                            {item.vote_average ? (
                              <span className="text-amber-400 font-bold">
                                ★ {item.vote_average.toFixed(1)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                  onClick={() => {
                    setMobileSearchOpen(false);
                  }}
                  className="block text-center text-xs font-bold text-red-400 hover:text-red-300 pt-2 pb-1 border-t border-white/[0.06] mt-1"
                >
                  Lihat semua hasil pencarian &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Mobile Sub-Nav Tab Bar (Home, Movies, Series, Anime, My List) */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-white/[0.06] -mx-4 px-3 bg-transparent overflow-x-auto scrollbar-none">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              pathname === "/"
                ? "bg-white/20 text-white shadow-sm ring-1 ring-white/30 backdrop-blur-sm"
                : "text-zinc-300 hover:text-white drop-shadow-sm"
            }`}
          >
            Home
          </Link>
          <Link
            href="/films"
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              pathname === "/films" || pathname.startsWith("/film")
                ? "bg-white/20 text-white shadow-sm ring-1 ring-white/30 backdrop-blur-sm"
                : "text-zinc-300 hover:text-white drop-shadow-sm"
            }`}
          >
            Movies
          </Link>
          <Link
            href="/series"
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              pathname.startsWith("/series")
                ? "bg-white/20 text-white shadow-sm ring-1 ring-white/30 backdrop-blur-sm"
                : "text-zinc-300 hover:text-white drop-shadow-sm"
            }`}
          >
            Series
          </Link>
          <Link
            href="/anime"
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              pathname.startsWith("/anime")
                ? "bg-[#FF6400] text-black font-black shadow-md shadow-[#FF6400]/25 ring-1 ring-[#FF6400]/50"
                : "text-zinc-300 hover:text-white drop-shadow-sm"
            }`}
          >
            <span>Anime</span>
            <span
              className={`text-[8px] px-1 py-0.2 rounded font-black ${
                pathname.startsWith("/anime")
                  ? "bg-black text-[#FF6400]"
                  : "bg-white/10 text-zinc-400"
              }`}
            >
              JP
            </span>
          </Link>
          <Link
            href="/favorites"
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              pathname === "/favorites"
                ? "bg-white/20 text-white shadow-sm ring-1 ring-white/30 backdrop-blur-sm"
                : "text-zinc-300 hover:text-white drop-shadow-sm"
            }`}
          >
            My List
          </Link>
        </div>

        {/* Mobile Dropdown Panel with Luxurious Frosted Glass */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden -mx-4 px-5 pt-3 pb-6 border-t border-white/[0.08] max-h-[80vh] overflow-y-auto animate-fade-in"
          >
            <nav className="flex flex-col space-y-1.5" aria-label="Navigasi mobile">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                if (link.href === "/genres") {
                  const isAnimeMode = pathname.startsWith("/anime");
                  return (
                    <div key={link.href} className="pt-1 pb-2">
                      <Link
                        href={isAnimeMode ? "/anime" : "/genres"}
                        onClick={() => setMenuOpen(false)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                          isActive
                            ? "text-white bg-white/[0.08]"
                            : "text-zinc-300 hover:text-white hover:bg-white/[0.05]"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span>{isAnimeMode ? "Genre Anime" : "Genres"}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isAnimeMode ? "text-[#FF6400]" : "text-zinc-500"}`}>
                          Semua &rarr;
                        </span>
                      </Link>
                      <div className="grid grid-cols-3 gap-1.5 px-1 pt-2">
                        {isAnimeMode
                          ? ANIME_GENRE_LIST.filter((g) => g.id !== "").slice(0, 9).map((g) => (
                              <Link
                                key={g.id}
                                href={`/anime?genre=${g.id}`}
                                onClick={() => setMenuOpen(false)}
                                className="text-xs text-center py-2 px-1 rounded-lg bg-white/[0.04] hover:bg-[#FF6400]/20 text-zinc-300 hover:text-[#FF6400] border border-white/[0.08] truncate font-medium transition-colors"
                              >
                                {g.name}
                              </Link>
                            ))
                          : POPULAR_GENRES.slice(0, 9).map((g) => (
                              <Link
                                key={g.id}
                                href={`/films?genre=${g.id}`}
                                onClick={() => setMenuOpen(false)}
                                className="text-xs text-center py-2 px-1 rounded-lg bg-white/[0.04] hover:bg-red-600/20 text-zinc-300 hover:text-white border border-white/[0.08] truncate font-medium transition-colors"
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
                    onClick={() => setMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                      isActive
                        ? "text-white bg-white/[0.08]"
                        : "text-zinc-300 hover:text-white hover:bg-white/[0.05]"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{link.label}</span>
                    <span className="text-zinc-600 text-xs">&rarr;</span>
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
