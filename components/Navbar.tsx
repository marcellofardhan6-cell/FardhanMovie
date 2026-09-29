"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchFocused(false);
        searchRef.current?.blur();
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
        setSearchFocused(false);
        searchRef.current?.blur();
      }
    },
    [searchQuery, router]
  );

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/films", label: "Film" },
    { href: "/series", label: "Serial TV" },
    { href: "/anime", label: "Anime" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#06070a]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
          : "bg-gradient-to-b from-[#06070a]/90 via-[#06070a]/40 to-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navigasi utama">
        <div className="flex items-center justify-between h-20">
          {/* Logo with gold emblem */}
          <Link
            href="/"
            className="group flex items-center gap-3 shrink-0"
            aria-label="FardhanFlix - Beranda"
          >
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1px] shadow-[0_0_20px_rgba(229,169,59,0.3)] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#08090d] rounded-[11px] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                  <path
                    d="M19.82 2H4.18C2.97 2 2 2.97 2 4.18v15.64C2 21.03 2.97 22 4.18 22h15.64c1.21 0 2.18-.97 2.18-2.18V4.18C22 2.97 21.03 2 19.82 2z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  />
                  <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" stroke="currentColor" strokeWidth="1.75" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span
                className="text-xl font-black tracking-tight text-white transition-colors duration-300 group-hover:text-amber-300"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                FARDHAN<span className="text-amber-400">FLIX</span>
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-zinc-400 -mt-1 font-medium">
                Cinema Premiere
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-full border border-white/[0.06] backdrop-blur-md" role="list">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500/20 to-amber-400/20 text-amber-300 border border-amber-400/30 shadow-[0_0_15px_rgba(229,169,59,0.15)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Search + Mobile Trigger */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} role="search" aria-label="Cari film atau serial">
              <div className="relative">
                <label htmlFor="navbar-search" className="sr-only">Cari film atau serial</label>
                <input
                  ref={searchRef}
                  id="navbar-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder="Cari judul film, serial, anime..."
                  autoComplete="off"
                  className={`text-xs rounded-full py-2.5 pl-9 pr-3 transition-all duration-300 ease-out border backdrop-blur-md ${
                    searchFocused
                      ? "w-64 bg-[#0e1017]/95 border-amber-400/50 shadow-[0_0_20px_rgba(229,169,59,0.2)] text-white"
                      : "w-40 sm:w-48 bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:border-white/20"
                  }`}
                  style={{ outline: "none" }}
                  aria-label="Cari film atau serial TV"
                />
                <svg
                  className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
                    searchFocused ? "text-amber-400" : "text-zinc-500"
                  }`}
                  width="14"
                  height="14"
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

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-zinc-300"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu navigasi"}
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

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            id="mobile-menu"
            ref={menuRef}
            className="md:hidden p-4 rounded-2xl my-2 bg-[#0c0e14]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl animate-fade-in"
          >
            <ul className="space-y-1" role="list">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-amber-400/15 text-amber-300 border border-amber-400/25"
                          : "text-zinc-300 hover:text-white hover:bg-white/[0.04]"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
