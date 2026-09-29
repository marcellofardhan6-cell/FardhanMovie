import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  href?: string;
}

export default function Logo({
  size = "md",
  showText = true,
  className = "",
  href = "/",
}: LogoProps) {
  // Dimensions based on size prop
  const iconDimensions = {
    sm: { box: 30, rx: 8 },
    md: { box: 34, rx: 9 },
    lg: { box: 44, rx: 12 },
  }[size];

  const textSize = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Precision Geometric Cinema Monogram "F" */}
      <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-105">
        {/* Ambient crimson halo behind icon */}
        <div className="absolute -inset-1 bg-red-600/25 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <svg
          width={iconDimensions.box}
          height={iconDimensions.box}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative block"
          aria-hidden="true"
        >
          <defs>
            {/* Dark glass base */}
            <linearGradient id="ff-bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1a1d28" />
              <stop offset="100%" stopColor="#0b0d13" />
            </linearGradient>

            {/* Signature Crimson Gradient */}
            <linearGradient id="ff-crimson" x1="8" y1="6" x2="28" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF3842" />
              <stop offset="50%" stopColor="#E50914" />
              <stop offset="100%" stopColor="#8A040B" />
            </linearGradient>

            {/* Top Bar Specular Highlight */}
            <linearGradient id="ff-highlight" x1="14" y1="7" x2="28" y2="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5C66" />
              <stop offset="100%" stopColor="#D80813" />
            </linearGradient>
          </defs>

          {/* Squircle container with precision cinema border */}
          <rect width="36" height="36" rx={iconDimensions.rx} fill="url(#ff-bg)" />
          <rect
            x="0.75"
            y="0.75"
            width="34.5"
            height="34.5"
            rx={iconDimensions.rx - 0.75}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
          />

          {/* Vertical Spine of "F" */}
          <path
            d="M9.5 8C9.5 7.45 9.95 7 10.5 7H14.5C15.05 7 15.5 7.45 15.5 8V28C15.5 28.55 15.05 29 14.5 29H10.5C9.95 29 9.5 28.55 9.5 28V8Z"
            fill="url(#ff-crimson)"
          />

          {/* Top Horizontal Bar with Dynamic Anamorphic Cut */}
          <path
            d="M15.5 7H25.2C26.15 7 26.8 8.01 26.4 8.87L24.8 12.37C24.55 12.92 24.01 13.27 23.41 13.27H15.5V7Z"
            fill="url(#ff-highlight)"
          />

          {/* Mid Horizontal Bar with Forward-Play Chevron Notch */}
          <path
            d="M15.5 15.5H22.5C23.46 15.5 24.11 16.52 23.69 17.38L22.25 20.34C22.02 20.82 21.54 21.12 21 21.12H15.5V15.5Z"
            fill="url(#ff-crimson)"
          />

          {/* Cinema Shutter Dot / Film Perforation Signature */}
          <circle cx="20.5" cy="26.5" r="2" fill="#FF3842" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-tight text-white transition-opacity ${textSize}`}
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Fardhan<span className="text-red-600 drop-shadow-[0_0_12px_rgba(229,9,20,0.5)]">Flix</span>
          </span>
          {size === "lg" && (
            <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 font-bold mt-1">
              Cinema Streaming
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="FardhanFlix - Beranda" className="inline-block focus:outline-none">
      {content}
    </Link>
  );
}
