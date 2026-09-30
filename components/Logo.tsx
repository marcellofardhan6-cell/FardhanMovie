"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  href?: string;
  forceAnime?: boolean;
}

export default function Logo({
  size = "md",
  showText = true,
  className = "",
  href = "/",
  forceAnime = false,
}: LogoProps) {
  const pathname = usePathname();
  const isAnime = forceAnime || pathname === "/anime" || pathname?.startsWith("/anime");

  const iconDimensions = {
    sm: { box: 24 },
    md: { box: 30 },
    lg: { box: 38 },
  }[size];

  const textSize = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2 group select-none transition-all duration-300 ${className}`}>
      {/* Precision Stencil Cinema Monogram */}
      <svg
        width={iconDimensions.box}
        height={iconDimensions.box}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 3H31V10.5H14.5V16H24.5V23.5H14.5V33H4V3ZM8 14.5L18.5 20L8 25.5V14.5Z"
          fill="#E50914"
        />
      </svg>

      {/* Typography Lockup */}
      {showText && (
        <div className="flex items-center tracking-tight leading-none">
          <div className="flex items-center font-black">
            <span className={`text-white transition-opacity group-hover:opacity-90 ${textSize}`}>
              FARD
            </span>
            <span className={`ml-0.5 text-[#E50914] ${textSize}`}>
              TV
            </span>
          </div>

          {/* Clean Sub-Brand Lockup for Anime Mode */}
          {isAnime && (
            <div className="flex items-center ml-2.5 pl-2.5 border-l border-zinc-700/80 animate-fade-in">
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.18em] text-zinc-300 uppercase">
                ANIME
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[9px] text-zinc-500 font-medium tracking-normal">
                アニメ
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      aria-label={isAnime ? "FardTV Anime - Beranda" : "FardTV - Beranda"}
      className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
    >
      {content}
    </Link>
  );
}
