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
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://fardtv.my.id/#website",
      name: "FardTV",
      alternateName: ["fardtv", "Fard TV", "FardhanTV", "Fardhan TV", "fardtv.my.id", "fardhantv.web.id"],
      url: "https://fardtv.my.id",
      description: "FardTV (FardhanTV) adalah platform nonton streaming film, anime, dan TV series sub Indo gratis tanpa iklan mengganggu.",
      inLanguage: "id-ID",
      image: "https://fardtv.my.id/icon-512.png",
      publisher: {
        "@id": "https://fardtv.my.id/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://fardtv.my.id/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://fardtv.my.id/#organization",
      name: "FardTV",
      alternateName: ["fardtv", "Fard TV", "FardhanTV", "fardtv.my.id", "fardhantv.web.id"],
      url: "https://fardtv.my.id",
      logo: {
        "@type": "ImageObject",
        url: "https://fardtv.my.id/icon-512.png",
        width: 512,
        height: 512,
      },
      image: "https://fardtv.my.id/icon-512.png",
      description: "FardTV adalah platform streaming film bioskop, anime, dan serial TV sub Indo gratis terlengkap dengan kualitas HD dan server cepat.",
      sameAs: [
        "https://fardtv.my.id",
        "https://fardhantv.web.id"
      ],
    },
    {
      "@type": "ItemList",
      "@id": "https://fardtv.my.id/#navigation",
      name: "FardTV Navigation Menu",
      itemListElement: [
        {
          "@type": "SiteNavigationElement",
          position: 1,
          name: "Movies",
          description: "Streaming film bioskop box office terbaru gratis sub Indo dengan kualitas HD dan server cepat di FardTV.",
          url: "https://fardtv.my.id/films",
        },
        {
          "@type": "SiteNavigationElement",
          position: 2,
          name: "Anime",
          description: "Streaming anime sub Indo terlengkap, serial shonen populer, movie animasi Jepang, dan jadwal rilis mingguan.",
          url: "https://fardtv.my.id/anime",
        },
        {
          "@type": "SiteNavigationElement",
          position: 3,
          name: "TV Series",
          description: "Binge watch serial TV dan drama series terpopuler lengkap dengan pemilih season dan episode.",
          url: "https://fardtv.my.id/series",
        },
        {
          "@type": "SiteNavigationElement",
          position: 4,
          name: "Genres",
          description: "Jelajahi koleksi film dan serial berdasarkan genre favorit seperti Action, Comedy, Drama, Horror, Romance, dan Sci-Fi.",
          url: "https://fardtv.my.id/genres",
        },
        {
          "@type": "SiteNavigationElement",
          position: 5,
          name: "Country",
          description: "Temukan film dan serial terbaik berdasarkan negara asal seperti Indonesia, Korea Selatan, Jepang, dan Amerika Serikat.",
          url: "https://fardtv.my.id/country",
        },
        {
          "@type": "SiteNavigationElement",
          position: 6,
          name: "Favorites",
          description: "Daftar tontonan pribadi dan koleksi film atau anime favorit yang Anda simpan di FardTV.",
          url: "https://fardtv.my.id/favorites",
        },
      ],
    },
  ],
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
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
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://cinesrc.st" />
        <link rel="dns-prefetch" href="https://vidlink.pro" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon" />
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
