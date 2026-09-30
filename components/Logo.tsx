"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAnimeTheme } from "@/context/AnimeThemeContext";

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
  href,
  forceAnime = false,
}: LogoProps) {
  const pathname = usePathname();
  const { isAnimeTheme } = useAnimeTheme();
  const isAnime = forceAnime || pathname === "/anime" || pathname?.startsWith("/anime") || isAnimeTheme;
  const targetHref = href !== undefined ? href : (isAnime ? "/anime" : "/");

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

  const accentColor = isAnime ? "#FF6400" : "#E50914";

  const content = (
    <div className={`inline-flex items-center gap-2 group select-none transition-all duration-300 ${className}`}>
      {/* Dynamic Stencil Monogram F */}
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
          fill={accentColor}
          className="transition-colors duration-300"
        />
      </svg>

      {/* Typography Lockup */}
      {showText && (
        <div className="flex items-center tracking-tight leading-none">
          <div className="flex items-center font-black">
            <span className={`text-white transition-opacity group-hover:opacity-90 ${textSize}`}>
              FARD
            </span>
            <span
              className={`ml-0.5 transition-colors duration-300 ${textSize}`}
              style={{ color: accentColor }}
            >
              TV
            </span>
          </div>

          {/* Crunchyroll Style Anime Badge */}
          {isAnime && (
            <div className="flex items-center ml-2.5 gap-1.5 animate-fade-in">
              <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-black tracking-wider bg-[#FF6400] text-black uppercase shadow-sm">
                ANIME
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold text-[#FF6400]">
                アニメ
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!targetHref) return content;

  return (
    <Link
      href={targetHref}
      aria-label={isAnime ? "FardTV Anime - Home" : "FardTV - Home"}
      className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6400] rounded"
    >
      {content}
    </Link>
  );
}
