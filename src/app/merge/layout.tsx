import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Merge PDF Files Online - Combine PDFs Free",
  description:
    "Combine multiple PDF files into one document instantly. Free online PDF merger that works in your browser. No upload required, 100% private. Drag and drop to reorder pages.",
  keywords: ["merge pdf", "combine pdf", "join pdf", "pdf merger", "merge pdf files", "combine pdf online free"],
  openGraph: {
    title: "Merge PDF Files Online - Combine PDFs Free",
    description: "Combine multiple PDF files into one document instantly. Free, private, no upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/merge",
  },
}

export default function MergeLayout({ children }: { children: React.ReactNode }) {
  return children
}
