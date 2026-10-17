import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorites",
  description:
    "View and manage your personal watchlist of saved movies, anime, and TV series on FardTV.",
  alternates: {
    canonical: "/favorites",
  },
  openGraph: {
    title: "Favorites | FardTV",
    description:
      "View and manage your personal watchlist of saved movies, anime, and TV series on FardTV.",
    url: "https://fardtv.my.id/favorites",
    siteName: "FardTV",
    type: "website",
  },
};

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
