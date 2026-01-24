"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { loadPdfForRender, type PDFDocumentProxy } from "@/lib/render"
import { addSignature } from "@/lib/pdf"
import { downloadBytes } from "@/lib/download"
import { ChevronLeft, ChevronRight, Eraser, Check } from "lucide-react"

export default function SignPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [pageImages, setPageImages] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [pageDimensions, setPageDimensions] = useState({ width: 612, height: 792 })
  const [signature, setSignature] = useState<string | null>(null)
  const [signaturePos, setSignaturePos] = useState({ x: 50, y: 600, width: 200, height: 80 })
  const [placing, setPlacing] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setLoading(true)
    try {
      setFile(f)
      const loaded = await loadPdfForRender(f)
      setPdf(loaded)

      const rendered: string[] = []
      for (let i = 1; i <= loaded.numPages; i++) {
        const page = await loaded.getPage(i)
        const viewport = page.getViewport({ scale: 1 })
        if (i === 1) setPageDimensions({ width: viewport.width, height: viewport.height })
        const canvas = document.createElement("canvas")
        const scale = 2
        canvas.width = viewport.width * scale
        canvas.height = viewport.height * scale
        const ctx = canvas.getContext("2d")!
        await page.render({ canvasContext: ctx, viewport: page.getViewport({ scale }) }).promise
        rendered.push(canvas.toDataURL("image/png"))
      }
      setPageImages(rendered)
      setCurrentPage(0)
    } catch (e) {
      console.error("failed to load pdf", e)
    }
    setLoading(false)
  }, [])

  const handleDownload = useCallback(async () => {
    if (!file || !signature) return

    setDownloading(true)
    try {
      const result = await addSignature(file, signature, { ...signaturePos, pageIndex: currentPage }, pageDimensions)
      const name = file.name.replace(".pdf", "-signed.pdf")
      downloadBytes(result, name)
    } catch (e) {
      console.error("failed to sign pdf", e)
    }
    setDownloading(false)
  }, [file, signature, signaturePos, currentPage, pageDimensions])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.stroke()
  }

  const stopDrawing = () => {
    setDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setSignature(canvas.toDataURL("image/png"))
    setPlacing(true)
  }

  const handleDrag = (e: React.MouseEvent) => {
    if (!placing || !editorRef.current) return
    const rect = editorRef.current.getBoundingClientRect()
    setSignaturePos((prev) => ({
      ...prev,
      x: Math.max(0, e.clientX - rect.left - prev.width / 2),
      y: Math.max(0, e.clientY - rect.top - prev.height / 2),
    }))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar
        title="sign pdf"
        onDownload={handleDownload}
        downloading={downloading}
        downloadDisabled={!file || !signature || !placing}
      />

      <main className="flex flex-1 flex-col">
        {!pdf ? (
          <div className="container mx-auto flex-1 px-4 py-8">
            <Dropzone onFiles={handleFile} accept=".pdf" className="mx-auto max-w-2xl" />
            {loading && <p className="mt-4 text-center text-muted-foreground">loading...</p>}
          </div>
        ) : (
          <div className="flex flex-1 min-h-0">
            <div className="flex flex-1 flex-col min-h-0">
              <div className="flex items-center justify-center gap-2 border-b px-4 py-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">page {currentPage + 1} of {pageImages.length}</span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentPage((p) => Math.min(pageImages.length - 1, p + 1))} disabled={currentPage === pageImages.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto bg-muted/50 p-4">
                <div className="mx-auto w-fit">
                  <div
                    ref={editorRef}
                    className="relative shadow-lg cursor-crosshair"
                    style={{ width: pageDimensions.width, height: pageDimensions.height }}
                    onClick={handleDrag}
                  >
                    {pageImages[currentPage] && (
                      <img src={pageImages[currentPage]} alt={`page ${currentPage + 1}`} className="pointer-events-none absolute inset-0 h-full w-full" draggable={false} />
                    )}
                    {signature && placing && (
                      <img
                        src={signature}
                        alt="signature"
                        className="absolute border-2 border-dashed border-primary"
                        style={{ left: signaturePos.x, top: signaturePos.y, width: signaturePos.width, height: signaturePos.height }}
                        draggable={false}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <aside className="w-72 border-l bg-background p-4">
              <h2 className="font-medium">draw signature</h2>

              <div className="mt-4 rounded border bg-white">
                <canvas
                  ref={canvasRef}
                  width={240}
                  height={100}
                  className="w-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>

              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" onClick={clearSignature}>
                  <Eraser className="mr-1 h-3 w-3" /> clear
                </Button>
                <Button size="sm" onClick={saveSignature}>
                  <Check className="mr-1 h-3 w-3" /> use
                </Button>
              </div>

              {placing && (
                <p className="mt-4 text-sm text-muted-foreground">
                  click on the pdf to position your signature
                </p>
              )}

              <div className="mt-6 pt-4 border-t">
                <label className="text-sm">signature size</label>
                <input
                  type="range"
                  min="100"
                  max="300"
                  value={signaturePos.width}
                  onChange={(e) => {
                    const w = Number(e.target.value)
                    setSignaturePos((prev) => ({ ...prev, width: w, height: w * 0.4 }))
                  }}
                  className="mt-1 w-full"
                />
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full" onClick={() => { setFile(null); setPdf(null); setSignature(null); setPlacing(false) }}>
                  start over
                </Button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
