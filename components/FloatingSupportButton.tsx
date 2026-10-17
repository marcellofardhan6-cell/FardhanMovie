"use client";

import { useEffect, useState } from "react";
import { useSupportModal } from "@/context/SupportModalContext";
import { usePreviewModal } from "@/context/PreviewModalContext";

export default function FloatingSupportButton() {
  const { openSupport, isOpen: isSupportOpen } = useSupportModal();
  const { isOpen: isPreviewOpen } = usePreviewModal();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show if modals are open or user hasn't scrolled
  if (!scrolled || isSupportOpen || isPreviewOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 animate-fade-in">
      <button
        type="button"
        onClick={openSupport}
        className="group relative flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-xl shadow-red-950/60 border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Support FardTV"
      >
        {/* Pulsing beacon */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
        </span>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-white group-hover:scale-110 transition-transform"
          aria-hidden="true"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>

        <span className="tracking-wide">Support FardTV</span>
      </button>
    </div>
  );
}
