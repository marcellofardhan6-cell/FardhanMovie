import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FardTV - Streaming Movies, Anime & Series",
    short_name: "FardTV",
    description: "Streaming film bioskop, anime, dan serial TV sub Indo gratis di FardTV.",
    start_url: "/",
    display: "standalone",
    background_color: "#090a0f",
    theme_color: "#E50914",
    icons: [
      {
        src: "/icon-48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/icon-96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
