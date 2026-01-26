"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mb-8">
              <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>

            <h1 className="text-7xl font-bold mb-4">404</h1>
            <h2 className="text-xl font-medium mb-2">page not found</h2>
            <p className="text-muted-foreground mb-8">
              the page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 font-medium hover:bg-foreground/90 transition-colors"
              >
                <Home className="h-4 w-4" />
                back to home
              </Link>
              <button
                onClick={() => typeof window !== 'undefined' && window.history.back()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-medium hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                go back
              </button>
            </div>

            <div className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground mb-4">popular tools</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { name: "merge", href: "/merge" },
                  { name: "split", href: "/split" },
                  { name: "compress", href: "/compress" },
                  { name: "edit", href: "/text" },
                  { name: "sign", href: "/sign" },
                ].map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="px-3 py-1.5 text-sm rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
