import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { WatchHistoryProvider } from "@/context/WatchHistoryContext";
import { AnimeThemeProvider } from "@/context/AnimeThemeContext";
import { PreviewModalProvider } from "@/context/PreviewModalContext";
import { SupportModalProvider } from "@/context/SupportModalContext";
import NetflixPreviewModal from "@/components/NetflixPreviewModal";
import SupportModal from "@/components/SupportModal";
import FloatingSupportButton from "@/components/FloatingSupportButton";

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
  title: { default: "FardTV - Free Movies & TV Series Streaming", template: "%s | FardTV" },
  description: "Watch trending movies, popular TV series, and anime online. Free HD streaming without ads.",
  keywords: ["movies", "streaming", "tv series", "anime", "cinema", "watch online"],
  verification: {
    google: "L1xsmzaUQHcwSEskRrjWbDUPrD4UZxxzK6cfs-FvaG8",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <AnimeThemeProvider>
          <FavoritesProvider>
            <WatchHistoryProvider>
              <PreviewModalProvider>
                <SupportModalProvider>
                  <Navbar />
                  <main className="min-h-screen">{children}</main>
                  <Footer />
                  <NetflixPreviewModal />
                  <SupportModal />
                  <FloatingSupportButton />
                </SupportModalProvider>
              </PreviewModalProvider>
            </WatchHistoryProvider>
          </FavoritesProvider>
        </AnimeThemeProvider>
      </body>
    </html>
  );
}
