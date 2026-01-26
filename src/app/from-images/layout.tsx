import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Images to PDF - Combine Images into PDF Free",
  description:
    "Combine multiple images into a single PDF document. Support for JPG, PNG, WebP and more. Free online tool, drag to reorder, no upload required.",
  keywords: ["images to pdf", "combine images to pdf", "multiple images to pdf", "photo to pdf", "pictures to pdf online free"],
  openGraph: {
    title: "Images to PDF - Combine Images into PDF Free",
    description: "Combine multiple images into a single PDF. Free, drag to reorder, no upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/from-images",
  },
}

export default function FromImagesLayout({ children }: { children: React.ReactNode }) {
  return children
}
