"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useSupportModal } from "@/context/SupportModalContext";

export default function SupportModal() {
  const { isOpen, closeSupport } = useSupportModal();
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSupport();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeSupport]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCopyNMID = useCallback(() => {
    navigator.clipboard.writeText("ID1026618336295");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={closeSupport}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-dialog-title"
    >
      <div
        className="relative w-full max-w-[460px] sm:max-w-[500px] rounded-2xl bg-[#07080b] border border-white/[0.1] text-white p-2.5 sm:p-3.5 shadow-2xl my-auto animate-fade-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={closeSupport}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-black/70 hover:bg-black text-zinc-400 hover:text-white transition-colors border border-white/10"
          aria-label="Close dialog"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <h2 id="support-dialog-title" className="sr-only">
          Support FardTV via QRIS
        </h2>

        {/* The Redesigned English QRIS Card */}
        <div className="relative w-full rounded-xl overflow-hidden shadow-xl border border-white/[0.08] bg-[#07080b]">
          <Image
            src="/fardtv-support-card.png"
            alt="FardTV QRIS Payment Card"
            width={800}
            height={980}
            className="w-full h-auto object-contain block select-none"
            priority
          />
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            type="button"
            onClick={handleCopyNMID}
            className="w-full py-2.5 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-emerald-400">NMID Copied!</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <span>Copy NMID</span>
              </>
            )}
          </button>

          <a
            href="/fardtv-support-card.png"
            download="FardTV-Support-QRIS.png"
            className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="3" />
            </svg>
            <span>Download QR</span>
          </a>
        </div>
      </div>
    </div>
  );
}
