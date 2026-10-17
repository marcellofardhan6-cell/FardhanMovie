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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={closeSupport}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-dialog-title"
    >
      <div
        className="relative w-full max-w-[380px] rounded-2xl bg-[#0c0e14] border border-white/[0.1] text-white p-5 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
            <h2 id="support-dialog-title" className="text-xs font-bold uppercase tracking-wider text-white">
              Support FardTV
            </h2>
          </div>
          <button
            type="button"
            onClick={closeSupport}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            aria-label="Close dialog"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Short honest subtext */}
        <p className="text-xs text-zinc-400 mb-4 leading-relaxed text-center">
          Help keep our streaming servers fast, free, and ad-free. Scan with any Indonesian banking or e-wallet app.
        </p>

        {/* Authentic White QRIS Card */}
        <div className="rounded-xl bg-white p-4 text-black shadow-lg border border-zinc-200 flex flex-col items-center">
          {/* QRIS Header */}
          <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
            <span className="text-base font-black tracking-tight text-black">
              QRIS
            </span>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              National QR Standard
            </span>
          </div>

          {/* Merchant Info */}
          <div className="text-center mb-2">
            <h3 className="text-sm font-extrabold tracking-wide uppercase text-zinc-900 leading-tight">
              Fardhan Marcello
            </h3>
            <p className="text-[11px] font-mono font-medium text-zinc-500 mt-0.5">
              NMID: ID1026618336295
            </p>
          </div>

          {/* Scannable QR Code */}
          <div className="relative w-[210px] h-[210px] bg-white flex items-center justify-center">
            <Image
              src="/qris-qr.png"
              alt="QRIS payment code for Fardhan Marcello"
              width={210}
              height={210}
              className="w-full h-full object-contain"
              priority
            />
          </div>

          {/* Card Terminal Info */}
          <div className="w-full text-center pt-2 mt-1 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Terminal: A01</span>
            <span>Code: 93600914</span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={handleCopyNMID}
            className="w-full py-2 px-3 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <span>Copy NMID</span>
              </>
            )}
          </button>

          <a
            href="/fardtv-support-card.png"
            download="FardTV-Support-QR.png"
            className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="3" />
            </svg>
            <span>Download QR</span>
          </a>
        </div>

        {/* Accepted Payment Channels */}
        <p className="text-[11px] text-zinc-500 text-center mt-3">
          Supports GoPay, BCA, Mandiri, BNI, BRI, and all QRIS apps
        </p>
      </div>
    </div>
  );
}
