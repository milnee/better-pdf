import { Metadata } from "next"

export const metadata: Metadata = {
  title: "PDF to Images - Convert PDF Pages to PNG/JPEG Free",
  description:
    "Convert PDF pages to PNG or JPEG images with custom quality settings. Free online converter that works in your browser. No upload required, download all pages.",
  keywords: ["pdf to png", "pdf to images", "convert pdf to png", "pdf to jpeg", "extract images from pdf"],
  openGraph: {
    title: "PDF to Images - Convert PDF Pages to PNG/JPEG Free",
    description: "Convert PDF pages to PNG or JPEG images. Free, customizable quality, no upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/to-images",
  },
}

export default function ToImagesLayout({ children }: { children: React.ReactNode }) {
  return children
}
