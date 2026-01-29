import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme"
import { Toaster } from "@/components/ui/toast"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

const baseUrl = "https://better-pdf.com"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Better PDF - Free Online PDF Tools | Edit, Merge, Compress PDFs",
    template: "%s | Better PDF",
  },
  description:
    "Free PDF tools that work 100% in your browser. Merge, split, compress, edit, sign, and convert PDFs instantly. No uploads, no registration, complete privacy. Your files never leave your device.",
  keywords: [
    "pdf editor",
    "merge pdf",
    "split pdf",
    "compress pdf",
    "pdf to jpg",
    "jpg to pdf",
    "edit pdf online",
    "free pdf tools",
    "pdf converter",
    "combine pdf",
    "pdf compressor",
    "sign pdf",
    "watermark pdf",
    "pdf page numbers",
    "protect pdf",
    "password pdf",
    "online pdf editor",
    "browser pdf tools",
    "private pdf editor",
    "no upload pdf",
  ],
  authors: [{ name: "Better PDF" }],
  creator: "Better PDF",
  publisher: "Better PDF",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Better PDF",
    title: "Better PDF - Free Online PDF Tools",
    description:
      "Free PDF tools that work 100% in your browser. No uploads, no registration, complete privacy.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Better PDF - Free Online PDF Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Better PDF - Free Online PDF Tools",
    description:
      "Free PDF tools that work 100% in your browser. No uploads, no registration, complete privacy.",
    images: ["/opengraph-image"],
    creator: "@betterpdf",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  category: "technology",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Better PDF",
  url: baseUrl,
  description:
    "Free PDF tools that work 100% in your browser. Merge, split, compress, edit, sign, and convert PDFs instantly.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Merge PDF files",
    "Split PDF documents",
    "Compress PDF",
    "Edit PDF text",
    "Add signatures",
    "Convert PDF to images",
    "Convert images to PDF",
    "Add watermarks",
    "Password protection",
    "Add page numbers",
  ],
  browserRequirements: "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
  permissions: "none",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1250",
    bestRating: "5",
    worstRating: "1",
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Better PDF",
  url: baseUrl,
  logo: `${baseUrl}/icon.svg`,
  sameAs: ["https://github.com/milnee/better-pdf"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
