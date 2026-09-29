"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex items-center justify-center min-h-screen px-4" style={{ background: "var(--bg)" }}>
      <div className="text-center max-w-md">
        <p className="text-5xl mb-6" aria-hidden>⚠</p>
        <h2 className="text-2xl font-semibold mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-fraunces)" }}>Terjadi kesalahan</h2>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>Tidak dapat memuat konten. Periksa koneksi internet dan coba lagi.</p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded text-sm font-medium transition-colors cursor-pointer"
          style={{ background: "var(--accent)", color: "#0a0a0f" }}
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
