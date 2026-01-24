"use client"

import { useState, useCallback } from "react"
import { Download } from "lucide-react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { loadPdfForRender, renderPage, type PDFDocumentProxy } from "@/lib/render"
import { canvasToBlob } from "@/lib/images"
import { downloadBlob, downloadMultipleAsZip } from "@/lib/download"

type Format = "png" | "jpeg"

interface PagePreview {
  pageNumber: number
  dataUrl: string
  canvas: HTMLCanvasElement
}

export default function ToImagesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [previews, setPreviews] = useState<PagePreview[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const [format, setFormat] = useState<Format>("png")
  const [quality, setQuality] = useState(92)
  const [scale, setScale] = useState(2)

  const handleFile = useCallback(
    async (files: File[]) => {
      const f = files[0]
      if (!f) return

      setFile(f)
      setLoading(true)
      setPreviews([])

      try {
        const loaded = await loadPdfForRender(f)
        setPdf(loaded)

        const newPreviews: PagePreview[] = []
        for (let i = 1; i <= loaded.numPages; i++) {
          const page = await loaded.getPage(i)
          const canvas = await renderPage(page, { scale })
          const dataUrl = canvas.toDataURL(`image/${format}`, quality / 100)
          newPreviews.push({ pageNumber: i, dataUrl, canvas })
        }
        setPreviews(newPreviews)
      } catch (e) {
        console.error("failed to load pdf", e)
      }

      setLoading(false)
    },
    [format, quality, scale]
  )

  const regeneratePreviews = useCallback(async () => {
    if (!pdf) return

    setLoading(true)
    const newPreviews: PagePreview[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const canvas = await renderPage(page, { scale })
      const dataUrl = canvas.toDataURL(`image/${format}`, quality / 100)
      newPreviews.push({ pageNumber: i, dataUrl, canvas })
    }
    setPreviews(newPreviews)
    setLoading(false)
  }, [pdf, format, quality, scale])

  const downloadSingle = useCallback(
    async (preview: PagePreview) => {
      const blob = await canvasToBlob(preview.canvas, format, quality / 100)
      const name = `page-${preview.pageNumber}.${format}`
      downloadBlob(blob, name)
    },
    [format, quality]
  )

  const downloadAll = useCallback(async () => {
    if (previews.length === 0) return

    setDownloading(true)
    try {
      const files = await Promise.all(
        previews.map(async (p) => ({
          name: `page-${p.pageNumber}.${format}`,
          blob: await canvasToBlob(p.canvas, format, quality / 100),
        }))
      )
      await downloadMultipleAsZip(files)
    } catch (e) {
      console.error("download failed", e)
    }
    setDownloading(false)
  }, [previews, format, quality])

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar
        title="pdf to images"
        onDownload={downloadAll}
        downloading={downloading}
        downloadDisabled={previews.length === 0}
        downloadLabel="download all (zip)"
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        {!pdf ? (
          <Dropzone onFiles={handleFile} accept=".pdf" className="mx-auto max-w-2xl" />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-muted/50 p-4">
              <div>
                <label className="text-sm text-muted-foreground">format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as Format)}
                  className="mt-1 block rounded border bg-background px-3 py-2"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                </select>
              </div>

              {format === "jpeg" && (
                <div>
                  <label className="text-sm text-muted-foreground">
                    quality ({quality}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="mt-1 block w-32"
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground">scale ({scale}x)</label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="mt-1 block w-32"
                />
              </div>

              <Button variant="outline" size="sm" onClick={regeneratePreviews} disabled={loading}>
                regenerate
              </Button>
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground">rendering pages...</p>
            ) : (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
              >
                {previews.map((preview) => (
                  <div key={preview.pageNumber} className="group relative rounded-lg border p-2">
                    <img
                      src={preview.dataUrl}
                      alt={`page ${preview.pageNumber}`}
                      className="w-full rounded bg-white"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        page {preview.pageNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadSingle(preview)}
                        aria-label={`download page ${preview.pageNumber}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
