"use client"

import Link from "next/link"
import { Moon, Sun, Github, ChevronDown, FileStack, Type, Scissors, Minimize2, PenTool, Image } from "lucide-react"
import { useTheme } from "@/components/providers/theme"
import { Button } from "@/components/ui/button"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

const popularTools = [
  { title: "Merge PDFs", href: "/merge", icon: FileStack },
  { title: "Edit PDF", href: "/text", icon: Type },
  { title: "Split PDF", href: "/split", icon: Scissors },
  { title: "Compress", href: "/compress", icon: Minimize2 },
  { title: "Sign PDF", href: "/sign", icon: PenTool },
  { title: "PDF to Images", href: "/to-images", icon: Image },
]

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="3" y="3" width="18" height="18" rx="4" className="fill-foreground" />
              <path d="M8 7h4.5a2.5 2.5 0 0 1 0 5H8V7z" className="fill-background" />
              <path d="M8 12h5a2.5 2.5 0 0 1 0 5H8v-5z" className="fill-background" />
              <rect x="8" y="7" width="2" height="10" className="fill-background" />
            </svg>
            <span>BETTER PDF</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                  Tools
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[200px] bg-background border rounded-lg p-2 shadow-lg animate-fade-in z-50"
                  sideOffset={8}
                >
                  {popularTools.map((tool) => (
                    <DropdownMenu.Item key={tool.href} asChild>
                      <Link
                        href={tool.href}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors outline-none cursor-pointer"
                      >
                        <tool.icon className="h-4 w-4 text-muted-foreground" />
                        {tool.title}
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Separator className="h-px bg-border my-2" />
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/#tools"
                      className="flex items-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors outline-none cursor-pointer"
                    >
                      View all tools →
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

          </nav>
        </div>

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
