import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Edit PDF Online - Free PDF Editor",
  description:
    "Edit PDF documents online for free. Add text, images, signatures, and highlights. Rotate, delete, and reorder pages. No upload required, works entirely in your browser.",
  keywords: ["edit pdf", "pdf editor", "edit pdf online free", "modify pdf", "add text to pdf", "pdf editor online"],
  openGraph: {
    title: "Edit PDF Online - Free PDF Editor",
    description: "Edit PDF documents online for free. Add text, images, signatures. No upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/text",
  },
}

export default function TextLayout({ children }: { children: React.ReactNode }) {
  return children
}
