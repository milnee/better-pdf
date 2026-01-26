import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF - Free Online Tool",
  description:
    "Add page numbers to your PDF documents. Choose position, format, and styling. Free online tool that works in your browser. No upload required.",
  keywords: ["add page numbers to pdf", "pdf page numbers", "number pdf pages", "page numbering pdf", "pdf page number online free"],
  openGraph: {
    title: "Add Page Numbers to PDF - Free Online Tool",
    description: "Add page numbers to your PDF documents. Customizable position and format. Free, no upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/pagenumbers",
  },
}

export default function PageNumbersLayout({ children }: { children: React.ReactNode }) {
  return children
}
