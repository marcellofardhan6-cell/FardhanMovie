"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#06070a] text-zinc-100">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-500">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-white" style={{ fontFamily: "var(--font-fraunces)" }}>Something went wrong</h2>
        <p className="mb-6 text-sm text-zinc-400">Unable to load content. Please check your connection and try again.</p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer bg-red-600 hover:bg-red-700 text-white"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
