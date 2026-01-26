import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Split PDF Online - Extract Pages from PDF Free",
  description:
    "Split PDF files and extract specific pages into a new document. Free online PDF splitter with page range support. No upload required, works entirely in your browser.",
  keywords: ["split pdf", "extract pdf pages", "pdf splitter", "separate pdf pages", "split pdf online free"],
  openGraph: {
    title: "Split PDF Online - Extract Pages from PDF Free",
    description: "Split PDF files and extract specific pages instantly. Free, private, no upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/split",
  },
}

export default function SplitLayout({ children }: { children: React.ReactNode }) {
  return children
}
