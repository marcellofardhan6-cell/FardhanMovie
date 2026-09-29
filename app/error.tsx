"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#06070a] text-zinc-100">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-6 text-red-500" aria-hidden>⚠</p>
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
