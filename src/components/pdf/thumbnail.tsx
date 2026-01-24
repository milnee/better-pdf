"use client"

import { useEffect, useRef, useState } from "react"
import { X, GripVertical } from "lucide-react"
import type { PDFPageProxy } from "@/lib/render"
import { renderPage } from "@/lib/render"

interface ThumbnailProps {
  page: PDFPageProxy
  pageNumber: number
  totalPages: number
  onRemove?: () => void
  isDragging?: boolean
  dragHandleProps?: Record<string, unknown>
}

export function Thumbnail({
  page,
  pageNumber,
  totalPages,
  onRemove,
  isDragging,
  dragHandleProps,
}: ThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    renderPage(page, { scale: 0.3, canvas }).then(() => setLoaded(true))
  }, [page])

  return (
    <div
      className={`group relative rounded-lg border bg-background p-2 transition-shadow ${
        isDragging ? "shadow-lg ring-2 ring-primary" : "hover:shadow-md"
      }`}
    >
      {dragHandleProps && (
        <button
          type="button"
          className="absolute left-2 top-2 cursor-grab rounded p-1 opacity-0 transition-opacity hover:bg-muted focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing"
          aria-label={`drag to reorder page ${pageNumber}`}
          {...dragHandleProps}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 rounded p-1 opacity-0 transition-opacity hover:bg-destructive hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
          aria-label={`remove page ${pageNumber}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="relative aspect-[3/4] overflow-hidden rounded bg-muted">
        <canvas
          ref={canvasRef}
          className={`h-full w-full object-contain transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
          aria-label={`page ${pageNumber} of ${totalPages}`}
        />
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
      </div>

      <p className="mt-2 text-center text-xs text-muted-foreground">
        {pageNumber} / {totalPages}
      </p>
    </div>
  )
}
