import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FavoritesProvider } from "@/context/FavoritesContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "FardhanFlix - Free Movies & TV Series Streaming", template: "%s | FardhanFlix" },
  description: "Watch trending movies, popular TV series, and anime online. Free HD streaming without ads.",
  keywords: ["movies", "streaming", "tv series", "anime", "cinema", "watch online"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <FavoritesProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </FavoritesProvider>
      </body>
    </html>
  );
}
