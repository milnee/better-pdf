import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Better PDF - Free Online PDF Tools",
    short_name: "Better PDF",
    description: "Free PDF tools that work 100% in your browser. No uploads, complete privacy.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#3B82F6",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}
