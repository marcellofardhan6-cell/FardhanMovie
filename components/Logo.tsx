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
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 group select-none transition-all duration-500 ${className}`}>
      {/* Dynamic Stencil Monogram F with Smooth Anime Shift */}
      <svg
        width={iconDimensions.box}
        height={iconDimensions.box}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="fard-anime-gradient" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF2E93" />
            <stop offset="60%" stopColor="#FF0055" />
            <stop offset="100%" stopColor="#8A0033" />
          </linearGradient>
        </defs>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 3H31V10.5H14.5V16H24.5V23.5H14.5V33H4V3ZM8 14.5L18.5 20L8 25.5V14.5Z"
          fill={isAnime ? "url(#fard-anime-gradient)" : "#E50914"}
          className="transition-colors duration-500"
        />
      </svg>

      {/* Pure Bold Cinema & Anime Typography */}
      {showText && (
        <div className="flex items-center font-black tracking-tight leading-none">
          <span className={`text-white transition-opacity group-hover:opacity-90 ${textSize}`}>
            FARD
          </span>
          <span
            className={`ml-0.5 transition-colors duration-500 ${textSize} ${
              isAnime ? "text-[#FF2E93] drop-shadow-[0_0_8px_rgba(255,46,147,0.6)]" : "text-[#E50914]"
            }`}
          >
            TV
          </span>

          {/* Anime Edition Katakana Badge */}
          {isAnime && (
            <span
              className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black tracking-widest bg-gradient-to-r from-pink-500 via-rose-500 to-red-600 text-white shadow-[0_0_12px_rgba(255,46,147,0.5)] border border-pink-400/40 uppercase transition-all duration-500 transform scale-100 animate-fadeIn"
              title="Anime Edition"
            >
              アニメ
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label={isAnime ? "FardTV Anime - Beranda" : "FardTV - Beranda"} className="inline-block focus:outline-none">
      {content}
    </Link>
  );
}
