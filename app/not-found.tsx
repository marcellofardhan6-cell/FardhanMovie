import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#06070a] text-zinc-100">
      <div className="text-center max-w-md">
        <p className="font-extrabold mb-4 text-6xl text-red-600 tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>404</p>
        <h2 className="text-2xl font-bold mb-3 text-white" style={{ fontFamily: "var(--font-fraunces)" }}>Page Not Found</h2>
        <p className="mb-6 text-sm text-zinc-400">The page you are looking for does not exist or has been moved.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl text-xs font-bold transition-colors bg-red-600 hover:bg-red-700 text-white"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
