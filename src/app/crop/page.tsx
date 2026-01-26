"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { loadPdfForRender, type PDFDocumentProxy } from "@/lib/render"
import { downloadBytes } from "@/lib/download"
import { addRecentFile } from "@/components/layout/recent"
import { FileDown, ChevronLeft, ChevronRight } from "lucide-react"
import { PDFDocument } from "pdf-lib"

interface CropMargins {
  top: number
  right: number
  bottom: number
  left: number
}

export default function CropPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageImage, setPageImage] = useState<string>("")
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 })
  const [margins, setMargins] = useState<CropMargins>({ top: 0, right: 0, bottom: 0, left: 0 })
  const [applyToAll, setApplyToAll] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setLoading(true)
    setFile(f)
    setCurrentPage(1)
    setMargins({ top: 0, right: 0, bottom: 0, left: 0 })

    try {
      const loaded = await loadPdfForRender(f)
      setPdf(loaded)
      addRecentFile({ name: f.name, size: f.size }, "crop pdf", "/crop")
    } catch (e) {
      console.error("failed to load pdf", e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!pdf) return

    const renderPage = async () => {
      const page = await pdf.getPage(currentPage)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement("canvas")
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext("2d")!
      await page.render({ canvasContext: ctx, viewport }).promise
      setPageImage(canvas.toDataURL("image/png"))
      setPageDimensions({ width: viewport.width, height: viewport.height })
    }

    renderPage()
  }, [pdf, currentPage])

  const handleSave = async () => {
    if (!file || !pdf) return

    setSaving(true)
    try {
      const buffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer)
      const pages = pdfDoc.getPages()

      const pagesToCrop = applyToAll ? pages : [pages[currentPage - 1]]

      for (const page of pagesToCrop) {
        const { width, height } = page.getSize()
        const cropBox = {
          x: (margins.left / 100) * width,
          y: (margins.bottom / 100) * height,
          width: width - ((margins.left + margins.right) / 100) * width,
          height: height - ((margins.top + margins.bottom) / 100) * height,
        }
        page.setCropBox(cropBox.x, cropBox.y, cropBox.width, cropBox.height)
      }

      const result = await pdfDoc.save()
      const name = file.name.replace(".pdf", "-cropped.pdf")
      downloadBytes(result, name)
    } catch (e) {
      console.error("failed to crop pdf", e)
    }
    setSaving(false)
  }

  const hasChanges = margins.top > 0 || margins.right > 0 || margins.bottom > 0 || margins.left > 0

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar title="crop pdf" />

      <main className="container mx-auto flex-1 px-4 py-8">
        {!pdf ? (
          <div className="mx-auto max-w-2xl">
            <Dropzone onFiles={handleFile} accept=".pdf" />
            {loading && (
              <p className="mt-4 text-center text-muted-foreground">loading pdf...</p>
            )}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>upload a pdf to crop page margins.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-medium">{file?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  page {currentPage} of {pdf.numPages}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={!hasChanges || saving}>
                  <FileDown className="mr-2 h-4 w-4" />
                  {saving ? "saving..." : "save pdf"}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr,280px] gap-6">
              <div className="relative border rounded-lg overflow-hidden bg-muted/30">
                <div className="relative inline-block">
                  {pageImage && (
                    <>
                      <img
                        src={pageImage}
                        alt={`Page ${currentPage}`}
                        className="max-w-full h-auto"
                      />
                      <div
                        className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 pointer-events-none"
                        style={{
                          top: `${margins.top}%`,
                          right: `${margins.right}%`,
                          bottom: `${margins.bottom}%`,
                          left: `${margins.left}%`,
                        }}
                      />
                      <div
                        className="absolute bg-red-500/20 pointer-events-none"
                        style={{ top: 0, left: 0, right: 0, height: `${margins.top}%` }}
                      />
                      <div
                        className="absolute bg-red-500/20 pointer-events-none"
                        style={{ bottom: 0, left: 0, right: 0, height: `${margins.bottom}%` }}
                      />
                      <div
                        className="absolute bg-red-500/20 pointer-events-none"
                        style={{ top: `${margins.top}%`, left: 0, bottom: `${margins.bottom}%`, width: `${margins.left}%` }}
                      />
                      <div
                        className="absolute bg-red-500/20 pointer-events-none"
                        style={{ top: `${margins.top}%`, right: 0, bottom: `${margins.bottom}%`, width: `${margins.right}%` }}
                      />
                    </>
                  )}
                </div>

                {pdf.numPages > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded hover:bg-muted disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium min-w-[60px] text-center">
                      {currentPage} / {pdf.numPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(pdf.numPages, p + 1))}
                      disabled={currentPage === pdf.numPages}
                      className="p-1 rounded hover:bg-muted disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">crop margins (%)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">top</label>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={margins.top}
                        onChange={(e) => setMargins(m => ({ ...m, top: Number(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-sm">{margins.top}%</span>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">right</label>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={margins.right}
                        onChange={(e) => setMargins(m => ({ ...m, right: Number(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-sm">{margins.right}%</span>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">bottom</label>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={margins.bottom}
                        onChange={(e) => setMargins(m => ({ ...m, bottom: Number(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-sm">{margins.bottom}%</span>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">left</label>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={margins.left}
                        onChange={(e) => setMargins(m => ({ ...m, left: Number(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-sm">{margins.left}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyToAll}
                      onChange={(e) => setApplyToAll(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">apply to all pages</span>
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setMargins({ top: 0, right: 0, bottom: 0, left: 0 })}
                  >
                    reset margins
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setPdf(null)
                  setPageImage("")
                  setMargins({ top: 0, right: 0, bottom: 0, left: 0 })
                }}
              >
                load different pdf
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
