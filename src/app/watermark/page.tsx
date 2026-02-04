"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { addWatermark, type WatermarkPattern } from "@/lib/pdf"
import { downloadBytes } from "@/lib/download"
import { loadPdfForRender, renderPage } from "@/lib/render"

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null)
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL")
  const [opacity, setOpacity] = useState(0.3)
  const [fontSize, setFontSize] = useState(48)
  const [pattern, setPattern] = useState<WatermarkPattern>("diagonal")
  const [downloading, setDownloading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleFile = useCallback((files: File[]) => {
    setFile(files[0] || null)
    setPreviewUrls([])
  }, [])

  useEffect(() => {
    if (!file) {
      setPreviewUrls([])
      return
    }

    const loadPreviews = async () => {
      const pdf = await loadPdfForRender(file)
      const urls: string[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const canvas = await renderPage(page, { scale: 0.8 })
        urls.push(canvas.toDataURL())
      }
      setPreviewUrls(urls)
    }

    loadPreviews()
  }, [file])

  const handleDownload = useCallback(async () => {
    if (!file || !watermarkText) return

    setDownloading(true)
    try {
      const result = await addWatermark(file, {
        text: watermarkText,
        opacity,
        fontSize,
        pattern,
      })
      const name = file.name.replace(".pdf", "-watermarked.pdf")
      downloadBytes(result, name)
    } catch {
    }
    setDownloading(false)
  }, [file, watermarkText, opacity, fontSize, pattern])

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar
        title="watermark pdf"
        onDownload={handleDownload}
        downloading={downloading}
        downloadDisabled={!file || !watermarkText}
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Dropzone onFiles={handleFile} accept=".pdf" />

          {file && (
            <div className="mt-8 space-y-6">
              <div className="rounded-lg border p-4">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">watermark text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="mt-1 w-full rounded border bg-background px-3 py-2"
                    placeholder="enter watermark text"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">opacity ({Math.round(opacity * 100)}%)</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">font size ({fontSize}px)</label>
                  <input
                    type="range"
                    min="24"
                    max="96"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">pattern</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["single", "diagonal"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPattern(p)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                          pattern === p
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {previewUrls.length > 0 ? (
                  previewUrls.map((url, idx) => (
                    <div key={idx} className="relative overflow-hidden rounded-lg border bg-muted">
                      <div className="relative">
                        <img src={url} alt={`Page ${idx + 1}`} className="w-full" />
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {pattern === "single" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="text-gray-500 font-bold whitespace-nowrap -rotate-45"
                                style={{ opacity, fontSize: fontSize * 0.35 }}
                              >
                                {watermarkText}
                              </span>
                            </div>
                          )}
                          {pattern === "diagonal" && (() => {
                            const previewFontSize = fontSize * 0.2
                            const rowSpacing = previewFontSize * 3
                            const rowCount = Math.ceil(800 / rowSpacing) + 5
                            return (
                              <div className="absolute -top-10 -left-10 -right-10 -bottom-10">
                                {Array.from({ length: rowCount }).map((_, row) => (
                                  <div
                                    key={row}
                                    className="flex absolute w-[150%]"
                                    style={{
                                      top: row * rowSpacing - 20,
                                      left: row % 2 ? 10 : -30,
                                      gap: previewFontSize * 2,
                                    }}
                                  >
                                    {Array.from({ length: 15 }).map((_, col) => (
                                      <span
                                        key={col}
                                        className="text-gray-500 font-bold -rotate-45 whitespace-nowrap"
                                        style={{ opacity, fontSize: previewFontSize }}
                                      >
                                        {watermarkText}
                                      </span>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      <p className="py-1 text-center text-xs text-muted-foreground bg-background">
                        page {idx + 1} of {previewUrls.length}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border bg-muted aspect-[8.5/11] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">loading preview...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
