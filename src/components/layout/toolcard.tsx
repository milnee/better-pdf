import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface ToolCardProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export function ToolCard({ title, description, href, icon: Icon }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-lg border bg-background p-5 transition-all duration-200 hover:bg-muted/50 hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-muted transition-colors group-hover:bg-foreground group-hover:text-background">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  )
}
