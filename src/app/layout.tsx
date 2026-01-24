import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme"
import { Toaster } from "@/components/ui/toast"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "pdfkit - privacy-first pdf tools",
  description:
    "free pdf tools that run entirely in your browser. merge, edit, convert pdfs without uploading files to any server.",
  keywords: ["pdf", "merge pdf", "pdf editor", "pdf to image", "privacy", "client-side"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
