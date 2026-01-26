import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compress PDF Online - Reduce PDF File Size Free",
  description:
    "Reduce PDF file size while maintaining quality. Free online PDF compressor that works in your browser. No upload required, instant results, 100% private.",
  keywords: ["compress pdf", "reduce pdf size", "pdf compressor", "shrink pdf", "compress pdf online free", "make pdf smaller"],
  openGraph: {
    title: "Compress PDF Online - Reduce PDF File Size Free",
    description: "Reduce PDF file size while maintaining quality. Free, private, instant results.",
  },
  alternates: {
    canonical: "https://better-pdf.com/compress",
  },
}

export default function CompressLayout({ children }: { children: React.ReactNode }) {
  return children
}
