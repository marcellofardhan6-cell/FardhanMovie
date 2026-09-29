"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
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
            <nav className="hidden md:flex items-center gap-6" aria-label="Navigasi utama">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
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
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearch} role="search" aria-label="Cari film atau serial">
              <div className="relative">
                <label htmlFor="navbar-search" className="sr-only">Cari film atau serial</label>
                <input
                  ref={searchRef}
                  id="navbar-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul..."
                  autoComplete="off"
                  className="w-36 sm:w-56 text-xs text-white bg-white/[0.05] focus:bg-[#0c0e15] border border-white/[0.08] focus:border-white/30 rounded-lg py-2 pl-8 pr-3 outline-none transition-all placeholder:text-zinc-500"
                  aria-label="Cari film atau serial TV"
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

            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
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

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden py-4 border-t border-white/[0.08] animate-fade-in"
          >
            <nav className="flex flex-col space-y-2" aria-label="Navigasi mobile">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
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
