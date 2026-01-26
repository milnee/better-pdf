import { Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="shrink-0">
              <rect x="4" y="2" width="24" height="28" rx="3" className="fill-foreground" />
              <path d="M20 2V8C20 9.1 20.9 10 22 10H28L20 2Z" className="fill-muted-foreground" />
              <rect x="8" y="14" width="16" height="2" rx="1" className="fill-background/40" />
              <rect x="8" y="19" width="12" height="2" rx="1" className="fill-background/40" />
              <rect x="8" y="24" width="14" height="2" rx="1" className="fill-background/40" />
            </svg>
            <span>Better PDF</span>
          </div>
          <div className="flex items-center gap-6">
            <span>100% private</span>
            <span>runs locally</span>
            <a
              href="https://github.com/milnee/better-pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              source
            </a>
          </div>
          <div>© {new Date().getFullYear()}</div>
        </div>
      </div>
    </footer>
  )
}
