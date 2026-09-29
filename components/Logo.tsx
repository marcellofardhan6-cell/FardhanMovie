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
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 group select-none ${className}`}>
      {/* 100% Flat Stencil Monogram F with Negative Space Play Button */}
      <svg
        width={iconDimensions.box}
        height={iconDimensions.box}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 3H31V10.5H14.5V16H24.5V23.5H14.5V33H4V3ZM8 14.5L18.5 20L8 25.5V14.5Z"
          fill="#E50914"
        />
      </svg>

      {/* Pure Bold Cinema Typography */}
      {showText && (
        <div className="flex items-center font-black tracking-tight leading-none">
          <span className={`text-white transition-opacity group-hover:opacity-90 ${textSize}`}>
            FARDHAN
          </span>
          <span className={`text-[#E50914] ml-0.5 ${textSize}`}>
            FLIX
          </span>
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
