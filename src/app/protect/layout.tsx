import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Protect PDF - Add Password Protection to PDF Free",
  description:
    "Add password protection to your PDF files. Secure your documents with encryption. Free online tool that works in your browser. No upload required, 100% private.",
  keywords: ["protect pdf", "password protect pdf", "encrypt pdf", "secure pdf", "lock pdf", "pdf password"],
  openGraph: {
    title: "Protect PDF - Add Password Protection to PDF Free",
    description: "Add password protection to your PDF files. Free, private, secure.",
  },
  alternates: {
    canonical: "https://better-pdf.com/protect",
  },
}

export default function ProtectLayout({ children }: { children: React.ReactNode }) {
  return children
}
