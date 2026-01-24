"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PDFDocumentProxy, PDFPageProxy } from "@/lib/render"
import { renderPage } from "@/lib/render"

interface ViewerProps {
  pdf: PDFDocumentProxy
  initialPage?: number
  onPageChange?: (page: number) => void
  onClick?: (x: number, y: number, pageIndex: number) => void
}

export function Viewer({ pdf, initialPage = 1, onPageChange, onClick }: ViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [scale, setScale] = useState(1)
  const [pageProxy, setPageProxy] = useState<PDFPageProxy | null>(null)

  useEffect(() => {
    pdf.getPage(currentPage).then(setPageProxy)
  }, [pdf, currentPage])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !pageProxy) return

    renderPage(pageProxy, { scale, canvas })
  }, [pageProxy, scale])

  useEffect(() => {
    onPageChange?.(currentPage)
  }, [currentPage, onPageChange])

  const goToPrevious = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentPage((p) => Math.min(pdf.numPages, p + 1))
  }, [pdf.numPages])

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(3, s + 0.25))
  }, [])

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(0.5, s - 0.25))
  }, [])

  const handleCanvasClick = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!onClick || !canvasRef.current || !pageProxy) return

      const rect = canvasRef.current.getBoundingClientRect()
      const viewport = pageProxy.getViewport({ scale: 1 })
      const x = (e.clientX - rect.left) / rect.width * viewport.width
      const y = viewport.height - (e.clientY - rect.top) / rect.height * viewport.height

      onClick(x, y, currentPage - 1)
    },
    [onClick, pageProxy, currentPage]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious()
      else if (e.key === "ArrowRight") goToNext()
      else if (e.key === "+" || e.key === "=") zoomIn()
      else if (e.key === "-") zoomOut()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToPrevious, goToNext, zoomIn, zoomOut])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            disabled={currentPage === 1}
            aria-label="previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {currentPage} / {pdf.numPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            disabled={currentPage === pdf.numPages}
            aria-label="next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            aria-label="zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-16 text-center text-sm">{Math.round(scale * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3}
            aria-label="zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/50 p-4"
      >
        <div className="mx-auto w-fit">
          <canvas
            ref={canvasRef}
            onPointerDown={handleCanvasClick}
            className={`bg-white shadow-lg ${onClick ? "cursor-crosshair" : ""}`}
            style={{ touchAction: "none" }}
            aria-label={`page ${currentPage} of ${pdf.numPages}`}
          />
        </div>
      </div>
    </div>
  )
}
