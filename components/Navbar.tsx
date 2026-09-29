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
    { href: "/series", label: "Serial" },
    { href: "/anime", label: "Anime" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,10,15,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navigasi utama">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="FardhanCine - Beranda"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <rect width="28" height="28" rx="4" fill="#e8a000" />
              <path d="M7 8h14M7 14h10M7 20h12" stroke="#0a0a0f" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="21" cy="20" r="2.5" fill="#0a0a0f" />
            </svg>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-fraunces)", color: "var(--text)" }}
            >
              FardhanCine
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="px-4 py-2 rounded text-sm font-medium transition-colors"
                  style={{
                    color: pathname === link.href ? "var(--accent)" : "var(--text-muted)",
                    background: pathname === link.href ? "rgba(232,160,0,0.08)" : "transparent",
                  }}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Search + mobile menu */}
          <div className="flex items-center gap-2">
            {/* Search */}
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
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  placeholder="Cari film..."
                  autoComplete="off"
                  className="text-sm rounded py-2 pl-9 pr-3 transition-all duration-200"
                  style={{
                    background: "var(--surface)",
                    border: `1px solid ${searchFocused ? "var(--accent)" : "var(--border)"}`,
                    color: "var(--text)",
                    width: searchFocused ? "200px" : "140px",
                    outline: "none",
                  }}
                  aria-label="Cari film atau serial TV"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--text-muted)" }}
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            </form>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu navigasi"}
              style={{ color: "var(--text-muted)" }}
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
            className="md:hidden pb-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <ul className="pt-3 space-y-1" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block px-4 py-3 rounded text-sm font-medium transition-colors"
                    style={{
                      color: pathname === link.href ? "var(--accent)" : "var(--text-muted)",
                      background: pathname === link.href ? "rgba(232,160,0,0.08)" : "transparent",
                    }}
                    aria-current={pathname === link.href ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
