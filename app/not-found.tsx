import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4" style={{ background: "var(--bg)" }}>
      <div className="text-center max-w-md">
        <p className="font-bold mb-4" style={{ fontSize: "6rem", lineHeight: 1, color: "var(--surface-2)", fontFamily: "var(--font-fraunces)" }}>404</p>
        <h2 className="text-2xl font-semibold mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-fraunces)" }}>Halaman tidak ditemukan</h2>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded text-sm font-medium transition-colors"
          style={{ background: "var(--accent)", color: "#0a0a0f" }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
