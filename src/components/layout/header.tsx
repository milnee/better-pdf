"use client"

import Link from "next/link"
import { Moon, Sun, Github } from "lucide-react"
import { useTheme } from "@/components/providers/theme"
import { Button } from "@/components/ui/button"

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="shrink-0">
            <rect x="4" y="2" width="24" height="28" rx="3" className="fill-foreground" />
            <path d="M20 2V8C20 9.1 20.9 10 22 10H28L20 2Z" className="fill-muted-foreground" />
            <rect x="8" y="14" width="16" height="2" rx="1" className="fill-background/40" />
            <rect x="8" y="19" width="12" height="2" rx="1" className="fill-background/40" />
            <rect x="8" y="24" width="14" height="2" rx="1" className="fill-background/40" />
          </svg>
          <span>Better PDF</span>
        </Link>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            asChild
          >
            <a
              href="https://github.com/milnee/better-pdf"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="view source on github"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={`switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
