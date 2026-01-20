import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TheStack.gg - MTG Life Tracker",
    short_name: "TheStack.gg",
    description: "Mobile-friendly Magic: The Gathering life tracker and toolkit",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0e12",
    theme_color: "#1f2937",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
