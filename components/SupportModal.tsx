"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useSupportModal } from "@/context/SupportModalContext";

const TIP_SUGGESTIONS = [
  { label: "Rp 5.000", note: "Coffee" },
  { label: "Rp 10.000", note: "Snack" },
  { label: "Rp 25.000", note: "Server Hour" },
  { label: "Rp 50.000", note: "Super Fan" },
];

export default function SupportModal() {
  const { isOpen, closeSupport } = useSupportModal();
  const [copied, setCopied] = useState(false);
  const [selectedTip, setSelectedTip] = useState<string | null>("Rp 10.000");

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={closeSupport}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-[#0c0e14] border border-white/[0.1] text-white shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top cinema red accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={closeSupport}
          className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          aria-label="Close support dialog"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Two-Column Responsive Layout - No Internal Scrollbar */}
        <div className="p-5 sm:p-6 md:p-7">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-7 items-center">
            
            {/* Left Column: Authentic QRIS Cinema Card */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[270px] rounded-2xl bg-white p-4 text-black shadow-xl border border-zinc-200">
                {/* QRIS Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
                  <span className="text-base font-black tracking-tight text-black">
                    QRIS
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                    National QR
                  </span>
                </div>

                {/* Merchant Name */}
                <div className="text-center mb-2">
                  <h3 className="text-sm font-extrabold tracking-wide uppercase text-zinc-900 leading-tight">
                    Fardhan Marcello
                  </h3>
                  <p className="text-[11px] font-mono font-medium text-zinc-600">
                    NMID: ID1026618336295
                  </p>
                </div>

                {/* Scannable QR Code */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white flex items-center justify-center p-1 border border-zinc-100">
                  <Image
                    src="/qris-qr.png"
                    alt="QRIS payment code for Fardhan Marcello"
                    width={220}
                    height={220}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>

                {/* Card Footer Code */}
                <div className="text-center pt-2 mt-1 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-600 font-mono">
                  <span>Terminal: A01</span>
                  <span>Code: 93600914</span>
                </div>
              </div>

              {/* Quick Scan Hint */}
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01" />
                </svg>
                <span>Scan with any banking or e-wallet app</span>
              </div>
            </div>

            {/* Right Column: Information, Preset Tips, Payment Methods, and Actions */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span>Creator Support</span>
                </div>
                <h2 id="support-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white font-[var(--font-fraunces)]">
                  Keep FardTV Free &amp; Fast
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                  We run FardTV without annoying ads or subscription fees. Your tip directly covers monthly server bandwidth, high-speed streaming infrastructure, and maintenance.
                </p>
              </div>

              {/* Suggested Tip Amount Pills */}
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                  <span className="font-semibold text-zinc-300">Suggested Tip:</span>
                  <span className="text-[11px] text-zinc-500">Scan QR and enter any amount</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIP_SUGGESTIONS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setSelectedTip(item.label)}
                      className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                        selectedTip === item.label
                          ? "bg-red-600/20 border-red-500 text-white font-bold shadow-sm"
                          : "bg-white/[0.04] border-white/[0.06] text-zinc-300 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{item.label}</div>
                      <div className="text-[9px] text-zinc-400 leading-tight mt-0.5">{item.note}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Supported Payment Channels */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Accepted via QRIS Standard:
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-sky-400">GoPay</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-blue-400">BCA</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-amber-400">Mandiri</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-orange-400">BNI</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-cyan-400">Bank BRI</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-emerald-400">ShopeePay</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-indigo-400">DANA / OVO</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href="/fardtv-support-card.png"
                  download="FardTV-Support-QR.png"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white transition-all cursor-pointer active:scale-95 text-center"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="3" />
                  </svg>
                  <span>Download QR</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyNMID}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-all cursor-pointer active:scale-95 text-center shadow-md shadow-red-950/50"
                >
                  {copied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-300">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>NMID Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      <span>Copy NMID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-0.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-emerald-400 shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Zero transaction fees for donors. Instant payment confirmation.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
