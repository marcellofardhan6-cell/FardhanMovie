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
    setTimeout(() => setCopied(false), 2200);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={closeSupport}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#090b10] border border-white/[0.08] p-5 sm:p-6 text-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600/10 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider mb-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span>Support Creator</span>
            </div>
            <h2 id="support-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white font-[var(--font-fraunces)]">
              Support FardTV
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
              Help keep our streaming servers fast, free, and ad-free. Every donation directly covers hosting and bandwidth costs.
            </p>
          </div>

          <button
            type="button"
            onClick={closeSupport}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
            aria-label="Close support dialog"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 space-y-4">
          {/* Card Frame with QR */}
          <div className="rounded-xl bg-[#0e1118] border border-white/[0.06] p-4 flex flex-col items-center">
            {/* Merchant info */}
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-white text-black tracking-wide">
                  QRIS
                </span>
                <span className="text-xs text-zinc-400 font-medium">National Standard QR Payment</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                FARDHAN MARCELLO
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs font-mono text-zinc-400">NMID: ID1026618336295</span>
                <button
                  type="button"
                  onClick={handleCopyNMID}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy NMID"
                >
                  {copied ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code Graphic Container */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-xl overflow-hidden bg-white p-2.5 shadow-lg flex items-center justify-center">
              <Image
                src="/qris-qr.png"
                alt="QRIS payment code for Fardhan Marcello"
                width={256}
                height={256}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            <div className="text-[11px] text-zinc-400 font-mono mt-2">
              Terminal: A01 • Printed Code: 93600914
            </div>

            {/* Payment methods badges */}
            <div className="w-full mt-4 pt-3 border-t border-white/[0.06]">
              <div className="text-[10px] uppercase tracking-wider text-center text-zinc-400 font-bold mb-2">
                Accepted Payment Methods
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-semibold">
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-sky-400">
                  GoPay
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-blue-400">
                  BCA
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-amber-400">
                  Mandiri
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-orange-400">
                  BNI
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-cyan-400">
                  Bank BRI
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-400 font-normal">
                  + All QRIS Apps
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="/fardtv-support-card.png"
              download="FardTV-Support-QR.png"
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-white transition-colors cursor-pointer text-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              <span>Download Card</span>
            </a>

            <button
              type="button"
              onClick={handleCopyNMID}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors cursor-pointer text-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <span>{copied ? "NMID Copied" : "Copy NMID"}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center pt-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-emerald-400 shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Instant &amp; secure transaction verified by Bank Indonesia</span>
          </div>
        </div>
      </div>
    </div>
  );
}
