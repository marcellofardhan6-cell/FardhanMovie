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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span>Donate via QRIS</span>
          </button>
        </div>

        {/* SEO Brand Description Section */}
        <div className="py-6 border-b border-white/[0.06] text-[11px] leading-relaxed text-zinc-500">
          <p className="font-semibold text-zinc-300 text-xs mb-1.5">
            FardTV - Platform Streaming Film, Anime &amp; TV Series Sub Indo Gratis
          </p>
          <p className="max-w-4xl text-zinc-400">
            FardTV (fardtv.my.id / fardhantv.web.id) adalah platform streaming film, anime, dan TV series sub Indo gratis terbaik tanpa iklan pop-up yang mengganggu. Nikmati pengalaman nonton movie bioskop kualitas HD terbaru, serial drama TV terlengkap, dan anime ongoing sub Indo dengan server cepat dan lancar hanya di FardTV.
          </p>
        </div>

        {/* Attribution & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="text-center sm:text-left">
            Created by{" "}
            <span className="text-zinc-300 font-medium">Fardhan Marcello</span>
            {" • "}
            Movie &amp; TV metadata provided by{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-200 underline transition-colors"
            >
              TMDB
            </a>.
          </p>
          <p className="text-zinc-500 text-[11px]">
            &copy; {new Date().getFullYear()} FardTV by Fardhan Marcello. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
