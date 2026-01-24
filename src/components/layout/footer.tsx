import { Shield, Github, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              privacy-first
            </span>
            <span className="flex items-center gap-1.5">
              <Github className="h-4 w-4" />
              open source
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            built with <Heart className="h-4 w-4 text-red-500" /> for the web
          </div>
        </div>
      </div>
    </footer>
  )
}
