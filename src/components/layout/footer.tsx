import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <rect x="3" y="3" width="18" height="18" rx="4" className="fill-foreground" />
              <path d="M8 7h4.5a2.5 2.5 0 0 1 0 5H8V7z" className="fill-background" />
              <path d="M8 12h5a2.5 2.5 0 0 1 0 5H8v-5z" className="fill-background" />
              <rect x="8" y="7" width="2" height="10" className="fill-background" />
            </svg>
            <span>© {new Date().getFullYear()} Better PDF</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <a
              href="https://github.com/milnee/better-pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
