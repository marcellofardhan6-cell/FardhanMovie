export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-transparent border-t-red-600 rounded-full animate-spin" style={{ borderTopColor: "var(--accent)" }} />
        <p style={{ color: "var(--text-muted)" }} className="text-sm">Memuat...</p>
      </div>
    </div>
  );
}
