import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Add Watermark to PDF Online - Free PDF Watermark Tool",
  description:
    "Add text watermarks to all pages of your PDF. Customize font, size, color, and opacity. Free online tool, no upload required, works in your browser.",
  keywords: ["watermark pdf", "add watermark to pdf", "pdf watermark", "stamp pdf", "watermark pdf online free"],
  openGraph: {
    title: "Add Watermark to PDF Online - Free PDF Watermark Tool",
    description: "Add text watermarks to your PDF documents. Free, customizable, no upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/watermark",
  },
}

export default function WatermarkLayout({ children }: { children: React.ReactNode }) {
  return children
}
