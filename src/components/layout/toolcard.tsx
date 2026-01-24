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
      className="group relative flex flex-col rounded-xl border bg-background p-6 transition-all hover:border-foreground/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  )
}
