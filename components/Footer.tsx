"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { useSupportModal } from "@/context/SupportModalContext";

export default function Footer() {
  const { openSupport } = useSupportModal();

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
              <li>
                <button
                  type="button"
                  onClick={openSupport}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                  </svg>
                  <span>Support FardTV</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Support Banner Callout */}
        <div className="py-6 border-b border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold text-zinc-200">
              Enjoying free, ad-free streaming?
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Support FardTV to help cover high-speed server bandwidth and infrastructure.
            </p>
          </div>
          <button
            type="button"
            onClick={openSupport}
            className="px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
            <span>Donate via QRIS</span>
          </button>
        </div>

        {/* SEO Brand Description Section */}
        <div className="py-6 border-b border-white/[0.06] text-[11px] leading-relaxed text-zinc-500">
          <p className="font-semibold text-zinc-300 text-xs mb-1.5">
            FardTV - Free HD Streaming for Movies, Anime &amp; TV Series
          </p>
          <p className="max-w-4xl text-zinc-400">
            FardTV is a fast, ad-free streaming catalog platform for HD movies, ongoing anime, and TV series with multiple reliable playback servers.
          </p>
        </div>

        {/* Attribution & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="text-center sm:text-left">
            Created by{" "}
            <span className="text-zinc-300 font-medium">Fardhan Marcello</span>
          </p>
          <p className="text-zinc-500 text-[11px]">
            &copy; {new Date().getFullYear()} FardTV by Fardhan Marcello. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
