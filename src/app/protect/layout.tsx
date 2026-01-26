import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Protect PDF - Add Password to PDF Free",
  description:
    "Add or remove password protection from PDF files. Encrypt your PDFs with a password for security. Free online tool, no upload required, 100% private.",
  keywords: ["protect pdf", "password pdf", "encrypt pdf", "lock pdf", "pdf password protection", "secure pdf online free"],
  openGraph: {
    title: "Protect PDF - Add Password to PDF Free",
    description: "Add or remove password protection from PDF files. Free, secure, no upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/protect",
  },
}

export default function ProtectLayout({ children }: { children: React.ReactNode }) {
  return children
}
