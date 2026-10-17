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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FardTV",
  alternateName: ["FardhanTV", "Fard TV", "Fardhan TV", "fardtv.my.id", "fardhantv.web.id"],
  url: "https://fardtv.my.id/",
  description: "FardTV (FardhanTV) adalah platform nonton streaming film, anime, dan TV series sub Indo gratis tanpa iklan mengganggu.",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fardtv.my.id"),
  title: {
    default: "FardTV (FardhanTV) - Nonton Movie, Anime & Series Streaming Gratis",
    template: "%s | FardTV",
  },
  description:
    "Streaming film bioskop, anime, dan TV series favorit gratis dengan kualitas HD dan tanpa iklan pop-up yang mengganggu di FardTV (fardtv.my.id / fardhantv.web.id).",
  keywords: [
    "fardtv",
    "fardhantv",
    "fard tv",
    "fardhan tv",
    "fardtv movie",
    "fardtv anime",
    "fardhantv web id",
    "fardtv my id",
    "nonton film gratis",
    "streaming movie gratis",
    "anime sub indo",
  ],
  authors: [{ name: "Fardhan Marcello" }],
  creator: "Fardhan Marcello",
  publisher: "FardTV",
  alternates: {
    canonical: "https://fardtv.my.id",
  },
  openGraph: {
    title: "FardTV (FardhanTV) - Nonton Movie, Anime & Series Streaming Gratis",
    description:
      "Streaming film bioskop, anime, dan TV series favorit gratis dengan kualitas HD dan tanpa iklan pop-up di FardTV.",
    url: "https://fardtv.my.id",
    siteName: "FardTV",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FardTV (FardhanTV) - Nonton Movie, Anime & Series Streaming Gratis",
    description:
      "Streaming film bioskop, anime, dan TV series favorit gratis dengan kualitas HD dan tanpa iklan pop-up di FardTV.",
  },
  verification: {
    google: [
      "L1xsmzaUQHcwSEskRrjWbDUPrD4UZxxzK6cfs-FvaG8",
      "google691342f243dce899.html",
      "google691342f243dce899",
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
                </SupportModalProvider>
              </PreviewModalProvider>
            </WatchHistoryProvider>
          </FavoritesProvider>
        </AnimeThemeProvider>
      </body>
    </html>
  );
}
