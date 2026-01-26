import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign PDF Online - Add Signature to PDF Free",
  description:
    "Add your signature to PDF documents for free. Draw or upload your signature and place it anywhere on the document. No upload required, 100% private.",
  keywords: ["sign pdf", "add signature to pdf", "pdf signature", "e-sign pdf", "sign pdf online free", "digital signature pdf"],
  openGraph: {
    title: "Sign PDF Online - Add Signature to PDF Free",
    description: "Add your signature to PDF documents for free. Draw or upload, no upload required.",
  },
  alternates: {
    canonical: "https://better-pdf.com/sign",
  },
}

export default function SignLayout({ children }: { children: React.ReactNode }) {
  return children
}
