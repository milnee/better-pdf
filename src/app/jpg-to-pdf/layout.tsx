import { Metadata } from "next"

export const metadata: Metadata = {
  title: "JPG to PDF Converter - Convert Images to PDF Free",
  description:
    "Convert JPG, PNG, and other images to PDF documents instantly. Free online converter, combine multiple images into one PDF. No upload required.",
  keywords: ["jpg to pdf", "image to pdf", "convert jpg to pdf", "png to pdf", "photo to pdf", "jpg to pdf converter online free"],
  openGraph: {
    title: "JPG to PDF Converter - Convert Images to PDF Free",
    description: "Convert images to PDF documents instantly. Free, combine multiple images, no upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/jpg-to-pdf",
  },
}

export default function JpgToPdfLayout({ children }: { children: React.ReactNode }) {
  return children
}
