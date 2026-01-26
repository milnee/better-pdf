import { Metadata } from "next"

export const metadata: Metadata = {
  title: "PDF Viewer - Preview PDF Files Online Free",
  description:
    "View and navigate through PDF documents in your browser. Free online PDF viewer with zoom, page navigation, and search. No upload required, 100% private.",
  keywords: ["pdf viewer", "view pdf online", "pdf reader", "preview pdf", "open pdf online free", "read pdf online"],
  openGraph: {
    title: "PDF Viewer - Preview PDF Files Online Free",
    description: "View and navigate through PDF documents in your browser. Free, private, no upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/preview",
  },
}

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return children
}
