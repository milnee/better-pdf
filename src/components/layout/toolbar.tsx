"use client"

import Link from "next/link"
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToolbarProps {
  title: string
  onDownload?: () => void
  downloading?: boolean
  downloadDisabled?: boolean
  downloadLabel?: string
}

export function Toolbar({
  title,
  onDownload,
  downloading,
  downloadDisabled,
  downloadLabel = "download",
}: ToolbarProps) {
  return (
    <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              back
            </Link>
          </Button>
          <span className="font-medium">{title}</span>
        </div>
        {onDownload && (
          <Button
            size="sm"
            onClick={onDownload}
            disabled={downloadDisabled || downloading}
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {downloadLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
