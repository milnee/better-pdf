import { Metadata } from "next"

export const metadata: Metadata = {
  title: "PDF to JPG Converter - Convert PDF to Images Free",
  description:
    "Convert PDF pages to high-quality JPG images instantly. Free online converter that works in your browser. No upload required, batch conversion supported.",
  keywords: ["pdf to jpg", "pdf to image", "convert pdf to jpg", "pdf to jpeg", "pdf to jpg converter online free"],
  openGraph: {
    title: "PDF to JPG Converter - Convert PDF to Images Free",
    description: "Convert PDF pages to high-quality JPG images instantly. Free, no upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/pdf-to-jpg",
  },
}

export default function PdfToJpgLayout({ children }: { children: React.ReactNode }) {
  return children
}
